/**
 * DailyDumpTab.ts — The Daily Dump tab.
 *
 * Features:
 *  - Date picker with quick "Today" jump
 *  - Full-width rendered markdown preview (click to edit, Obsidian-style)
 *  - Debounced auto-save that preserves editor focus
 *  - Optional sync to Obsidian daily note
 */

import { TFile, MarkdownRenderer } from 'obsidian';
import DocketPlugin from './main';
import { todayString } from './types';

const DEBOUNCE_MS = 800;

export class DailyDumpTab {
  private container: HTMLElement;
  private plugin: DocketPlugin;

  private selectedDate: string;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private scratchpadArea!: HTMLElement;
  private autosaveLabel!: HTMLElement;
  private previewEl!: HTMLElement;
  private isEditing = false;

  constructor(container: HTMLElement, plugin: DocketPlugin) {
    this.container = container;
    this.plugin = plugin;
    this.selectedDate = todayString();
  }

  render(): void {
    this.container.empty();
    const inner = this.container.createDiv('docket-daily-dump');

    this.renderDateSelector(inner);
    this.renderScratchpadSection(inner);
  }

  private renderDateSelector(parent: HTMLElement): void {
    const strip = parent.createDiv('docket-date-selector-strip');

    const dateInput = strip.createEl('input', {
      cls: 'docket-date-input',
      attr: { type: 'date' },
    });
    dateInput.value = this.selectedDate;

    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        this.commitEditIfNeeded();
        this.selectedDate = dateInput.value;
        this.refreshScratchpad();
      }
    });

    const todayBtn = strip.createDiv({ cls: 'docket-cal-today-btn', text: 'Today' });
    todayBtn.addEventListener('click', () => {
      this.commitEditIfNeeded();
      this.selectedDate = todayString();
      dateInput.value = this.selectedDate;
      this.refreshScratchpad();
    });

    this.renderSyncStatus(strip);
  }

  private renderScratchpadSection(parent: HTMLElement): void {
    this.scratchpadArea = parent.createDiv('docket-scratchpad-section');
    this.buildScratchpadContent();
  }

  private refreshScratchpad(): void {
    this.isEditing = false;
    this.scratchpadArea.empty();
    this.buildScratchpadContent();
  }

  private buildScratchpadContent(): void {
    const main = this.scratchpadArea.createDiv('docket-scratchpad-main');

    const spHeader = main.createDiv('docket-scratchpad-header');
    spHeader.createSpan({
      cls: 'docket-scratchpad-date',
      text: `📝 ${this.formatDisplayDate(this.selectedDate)}`,
    });

    this.autosaveLabel = spHeader.createSpan({ cls: 'docket-autosave-label', text: 'Auto-saves' });

    this.previewEl = main.createDiv('docket-scratchpad-preview markdown-rendered');
    const content = this.plugin.settings.dailyDumps[this.selectedDate] ?? '';
    this.renderPreview(content);

    this.previewEl.addEventListener('click', () => {
      if (!this.isEditing) this.enterEditMode();
    });
  }

  private renderPreview(content: string): void {
    this.previewEl.empty();
    if (!content.trim()) {
      this.previewEl.createDiv({
        cls: 'docket-scratchpad-placeholder',
        text: 'Click to start writing…',
      });
      return;
    }
    MarkdownRenderer.render(this.app, content, this.previewEl, '', this.plugin);
  }

  private enterEditMode(): void {
    if (this.isEditing) return;
    this.isEditing = true;

    const content = this.plugin.settings.dailyDumps[this.selectedDate] ?? '';
    this.previewEl.empty();
    this.previewEl.removeClass('markdown-rendered');
    this.previewEl.addClass('docket-scratchpad-editing');

    const editor = this.previewEl.createEl('textarea', {
      cls: 'docket-scratchpad-editor',
    }) as HTMLTextAreaElement;

    editor.placeholder = [
      `Thoughts for ${this.formatDisplayDate(this.selectedDate)}…`,
      '',
      '- [ ] Ideas to process',
      '- Meeting notes',
      '- Anything on your mind',
    ].join('\n');
    editor.value = content;
    editor.focus();

    editor.addEventListener('input', () => {
      this.debouncedSave(editor.value);
    });

    const finishEdit = () => {
      if (!this.isEditing) return;
      this.isEditing = false;
      const value = editor.value;
      this.plugin.settings.dailyDumps[this.selectedDate] = value;
      this.previewEl.empty();
      this.previewEl.removeClass('docket-scratchpad-editing');
      this.previewEl.addClass('markdown-rendered');
      this.renderPreview(value);
    };

    editor.addEventListener('blur', () => {
      finishEdit();
    });

    editor.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        editor.blur();
      }
    });
  }

  private commitEditIfNeeded(): void {
    const editor = this.previewEl?.querySelector('.docket-scratchpad-editor') as HTMLTextAreaElement | null;
    if (editor && this.isEditing) {
      this.plugin.settings.dailyDumps[this.selectedDate] = editor.value;
      this.isEditing = false;
    }
  }

  private renderSyncStatus(parent: HTMLElement): void {
    const dnPlugin = (this.app as any).plugins?.plugins?.['daily-notes'];
    const pnPlugin = (this.app as any).plugins?.plugins?.['periodic-notes'];
    if (!dnPlugin && !pnPlugin) return;

    const syncBtn = parent.createEl('button', {
      text: 'Sync to daily note',
      cls: 'docket-sync-btn',
    });
    syncBtn.addEventListener('click', async () => {
      await this.syncToDaily();
      syncBtn.textContent = 'Synced ✓';
      setTimeout(() => { syncBtn.textContent = 'Sync to daily note'; }, 2000);
    });
  }

  private async syncToDaily(): Promise<void> {
    const content = this.plugin.settings.dailyDumps[this.selectedDate];
    if (!content) return;

    try {
      const fileName = `${this.selectedDate}.md`;
      const file = this.app.vault.getAbstractFileByPath(fileName);
      const section = `\n\n## 🗂️ Docket Dump\n\n${content}`;

      if (file instanceof TFile) {
        const existing = await this.app.vault.read(file);
        if (existing.includes('## 🗂️ Docket Dump')) {
          const updated = existing.replace(
            /## 🗂️ Docket Dump[\s\S]*?(?=\n## |\n---|$)/,
            `## 🗂️ Docket Dump\n\n${content}\n`
          );
          await this.app.vault.modify(file, updated);
        } else {
          await this.app.vault.modify(file, existing + section);
        }
      } else {
        await this.app.vault.create(fileName, `# ${this.selectedDate}${section}`);
      }
    } catch (err) {
      console.error('Docket: Daily note sync error', err);
    }
  }

  private debouncedSave(content: string): void {
    this.autosaveLabel.textContent = 'Saving…';
    this.autosaveLabel.addClass('is-saving');

    if (this.saveTimer !== null) clearTimeout(this.saveTimer);

    this.saveTimer = setTimeout(async () => {
      this.plugin.settings.dailyDumps[this.selectedDate] = content;
      await this.plugin.saveSettings(true);

      this.autosaveLabel.textContent = 'Saved ✓';
      this.autosaveLabel.removeClass('is-saving');

      setTimeout(() => {
        this.autosaveLabel.textContent = 'Auto-saves';
      }, 2000);
    }, DEBOUNCE_MS);
  }

  private formatDisplayDate(dateStr: string): string {
    const date = new Date(`${dateStr}T12:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private get app() {
    return this.plugin.app;
  }
}

import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { StateField, StateEffect, Extension } from "@codemirror/state";

// Effect to add/update a remote cursor
export const addCursor = StateEffect.define<{
  userId: string;
  userName: string;
  pos: number;
  color: string;
}>();

// Effect to remove a remote cursor
export const removeCursor = StateEffect.define<{ userId: string }>();

// Cursor widget that displays above the text
class CursorWidget extends WidgetType {
  constructor(readonly color: string, readonly userName: string) {
    super();
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = "cm-remote-cursor";
    wrap.style.position = "relative";
    wrap.style.display = "inline";

    // Cursor line
    const cursor = document.createElement("span");
    cursor.style.borderLeft = `2px solid ${this.color}`;
    cursor.style.height = "1.2em";
    cursor.style.display = "inline-block";
    cursor.style.position = "relative";
    cursor.style.marginLeft = "-1px";
    cursor.style.zIndex = "10";

    // Name label
    const label = document.createElement("span");
    label.textContent = this.userName;
    label.style.position = "absolute";
    label.style.top = "-18px";
    label.style.left = "0";
    label.style.backgroundColor = this.color;
    label.style.color = "#ffffff";
    label.style.padding = "2px 6px";
    label.style.borderRadius = "3px";
    label.style.fontSize = "11px";
    label.style.fontWeight = "500";
    label.style.whiteSpace = "nowrap";
    label.style.zIndex = "10";
    label.style.pointerEvents = "none";

    cursor.appendChild(label);
    wrap.appendChild(cursor);

    return wrap;
  }

  eq(other: CursorWidget) {
    return other.color === this.color && other.userName === this.userName;
  }
}

// State field to manage remote cursors
const remoteCursorsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(cursors, tr) {
    // Map existing cursors through document changes
    cursors = cursors.map(tr.changes);

    // Process effects
    for (let effect of tr.effects) {
      if (effect.is(addCursor)) {
        const { userId, userName, pos, color } = effect.value;

        // Remove old cursor for this user
        cursors = cursors.update({
          filter: (from, to, value) => {
            return !(value.spec?.userId === userId);
          },
        });

        // Add new cursor
        if (pos >= 0 && pos <= tr.newDoc.length) {
          const deco = Decoration.widget({
            widget: new CursorWidget(color, userName),
            side: 1,
            userId, // Store userId in spec for filtering
          }).range(pos);

          cursors = cursors.update({
            add: [deco],
          });
        }
      } else if (effect.is(removeCursor)) {
        const { userId } = effect.value;
        cursors = cursors.update({
          filter: (from, to, value) => {
            return !(value.spec?.userId === userId);
          },
        });
      }
    }

    return cursors;
  },

  provide: (f) => EditorView.decorations.from(f),
});

// Extension that adds remote cursor support
export function remoteCursors(): Extension {
  return [remoteCursorsField];
}

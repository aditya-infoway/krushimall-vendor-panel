import { useEffect } from "react";
import {
  useEditor,
  EditorContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function TextEditor({
  value,
  onChange,
  readOnly = false,
}: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],

    content: value || "",

    editable: !readOnly,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Show saved terms after API data is fetched
  useEffect(() => {
    if (!editor) return;

    const savedContent =
      value || "";

    const currentContent =
      editor.getHTML();

    if (
      currentContent !==
      savedContent
    ) {
      editor.commands.setContent(
        savedContent,
        {
          emitUpdate: false,
        },
      );
    }
  }, [editor, value]);

  // Update editor editable/read-only mode
  useEffect(() => {
    if (!editor) return;

    editor.setEditable(
      !readOnly,
    );
  }, [editor, readOnly]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
      {!readOnly && (
        <div className="flex flex-wrap gap-2 border-b border-gray-300 p-2 dark:border-gray-700">
          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleBold()
                .run()
            }
            className={`rounded px-3 py-1 font-bold ${
              editor?.isActive(
                "bold",
              )
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            B
          </button>

          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleItalic()
                .run()
            }
            className={`rounded px-3 py-1 italic ${
              editor?.isActive(
                "italic",
              )
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            I
          </button>

          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleUnderline()
                .run()
            }
            className={`rounded px-3 py-1 underline ${
              editor?.isActive(
                "underline",
              )
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            U
          </button>

          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleBulletList()
                .run()
            }
            className={`rounded px-3 py-1 ${
              editor?.isActive(
                "bulletList",
              )
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            • List
          </button>

          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
            className={`rounded px-3 py-1 ${
              editor?.isActive(
                "orderedList",
              )
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            1. List
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="
          min-h-[180px]
          p-4

          [&_.ProseMirror]:min-h-[150px]
          [&_.ProseMirror]:outline-none

          [&_.ProseMirror_p]:my-1

          [&_.ProseMirror_ol]:ml-6
          [&_.ProseMirror_ol]:list-decimal

          [&_.ProseMirror_ul]:ml-6
          [&_.ProseMirror_ul]:list-disc

          [&_.ProseMirror_li]:my-1
        "
      />
    </div>
  );
}
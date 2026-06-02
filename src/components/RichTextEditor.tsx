import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Minus, Link as LinkIcon, Image as ImageIcon, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Code, Undo, Redo, Type, Palette, RotateCcw,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Sans", value: "ui-sans-serif, system-ui, sans-serif" },
];

const TEXT_COLORS = [
  "#ffffff", "#d1d5db", "#9ca3af", "#f59e0b", "#f97316",
  "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
];

const HIGHLIGHT_COLORS = [
  "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff",
  "#fed7aa", "#fce7f3", "#cffafe",
];

function ToolBtn({
  active, disabled, onClick, title, children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-7 w-7 rounded flex items-center justify-center transition-colors text-sm
        ${active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

function ToolSep() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article here…",
  minHeight = "520px",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgOpen, setImgOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline underline-offset-4 hover:opacity-80" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full my-4 shadow-sm" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkToLink({ href: url }).setLink({ href: url }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor || !imgUrl) return;
    editor.chain().focus().setImage({ src: imgUrl }).run();
    setImgUrl("");
    setImgOpen(false);
  }, [editor, imgUrl]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/30 px-3 py-2 flex flex-wrap items-center gap-0.5">

        {/* History */}
        <ToolBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={13} />
        </ToolBtn>
        <ToolBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={13} />
        </ToolBtn>
        <ToolSep />

        {/* Font family */}
        <Select
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onValueChange={(v) => {
            editor.chain().focus();
            if (v) editor.chain().focus().setFontFamily(v).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
        >
          <SelectTrigger className="h-7 w-[90px] text-xs border-none bg-transparent shadow-none hover:bg-muted focus:ring-0 px-2">
            <Type size={12} className="mr-1 shrink-0" />
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value} value={f.value || "__default__"} className="text-xs">
                <span style={{ fontFamily: f.value || undefined }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToolSep />

        {/* Inline marks */}
        <ToolBtn title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={13} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={13} />
        </ToolBtn>
        <ToolBtn title="Code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={13} />
        </ToolBtn>
        <ToolSep />

        {/* Text color */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Text color"
              className="h-7 w-7 rounded flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Palette size={12} />
              <div
                className="h-1 w-4 rounded-full"
                style={{ backgroundColor: editor.getAttributes("textStyle").color || "currentColor" }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-medium">Text Color</p>
            <div className="flex gap-1 flex-wrap max-w-[140px]">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                />
              ))}
              <button
                type="button"
                title="Remove color"
                className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform bg-card flex items-center justify-center"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                <RotateCcw size={9} className="text-muted-foreground" />
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Highlight"
              className={`h-7 w-7 rounded flex flex-col items-center justify-center gap-0.5 transition-colors
                ${editor.isActive("highlight") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Highlighter size={12} />
              <div className="h-1 w-4 rounded-full bg-yellow-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground font-medium">Highlight Color</p>
            <div className="flex gap-1 flex-wrap max-w-[140px]">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                />
              ))}
              <button
                type="button"
                title="Remove highlight"
                className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform bg-card flex items-center justify-center"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                <RotateCcw size={9} className="text-muted-foreground" />
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <ToolSep />

        {/* Headings */}
        <ToolBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={13} />
        </ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={13} />
        </ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={13} />
        </ToolBtn>
        <ToolSep />

        {/* Lists & blocks */}
        <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={13} />
        </ToolBtn>
        <ToolBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={13} />
        </ToolBtn>
        <ToolBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={13} />
        </ToolBtn>
        <ToolBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={13} />
        </ToolBtn>
        <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={13} />
        </ToolBtn>
        <ToolSep />

        {/* Alignment */}
        <ToolBtn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={13} />
        </ToolBtn>
        <ToolBtn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={13} />
        </ToolBtn>
        <ToolBtn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={13} />
        </ToolBtn>
        <ToolBtn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify size={13} />
        </ToolBtn>
        <ToolSep />

        {/* Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Insert link"
              className={`h-7 w-7 rounded flex items-center justify-center transition-colors
                ${editor.isActive("link") ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <LinkIcon size={13} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Insert link</p>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-8 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") insertLink(); }}
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs bg-gradient-gold hover:opacity-90" onClick={insertLink}>Apply</Button>
              {editor.isActive("link") && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}>Remove</Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover open={imgOpen} onOpenChange={setImgOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Insert image"
              className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ImageIcon size={13} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Insert image by URL</p>
            <Input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-8 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") insertImage(); }}
            />
            <Button size="sm" className="w-full h-7 text-xs bg-gradient-gold hover:opacity-90" onClick={insertImage}>Insert</Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Content area */}
      <div className="relative px-6 py-5" style={{ minHeight }}>
        <EditorContent
          editor={editor}
          className="rich-editor"
        />
        <div className="absolute bottom-3 right-4 text-[10px] text-muted-foreground bg-card/80 backdrop-blur px-2 py-0.5 rounded-full border border-border pointer-events-none">
          {wordCount} words
        </div>
      </div>
    </div>
  );
}

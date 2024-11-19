"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Heading from "@tiptap/extension-heading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CheckSquare,
  Table as TableIcon,
  ChevronDown,
  RowsIcon,
  ColumnsIcon,
  Merge,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Level } from "@tiptap/extension-heading";

export default function Editor({ htmlContent }: { htmlContent: string }) {
  const [content, setContent] = useState(htmlContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: "What would you like to write?",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-fixed w-full",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const toggleHeading = (level: string) => {
    const parsedLevel = parseInt(level) as Level;
    if (Number(level) === 0) {
      editor.chain().focus().setParagraph().run();
      return;
    }
    editor.chain().focus().toggleHeading({ level: parsedLevel }).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run();
  };

  const mergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  const splitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  const setTableAlignment = (alignment: any) => {
    editor
      .chain()
      .focus()
      .updateAttributes("table", { textAlign: alignment })
      .run();
  };

  return (
    <div className="w-[80vw]">
      <div className="border-b sticky top-0 z-10 bg-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-muted" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-muted" : ""}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-muted" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive("taskList") ? "bg-muted" : ""}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Select onValueChange={toggleHeading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Heading" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Heading 1</SelectItem>
              <SelectItem value="2">Heading 2</SelectItem>
              <SelectItem value="3">Heading 3</SelectItem>
              <SelectItem value="4">Heading 4</SelectItem>
              <SelectItem value="0">Normal Text</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-muted" : ""}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <TableIcon className="h-4 w-4" />
                Table
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={insertTable}>
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={addColumnBefore}>
                <ColumnsIcon className="h-4 w-4 mr-2" />
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={addColumnAfter}>
                <ColumnsIcon className="h-4 w-4 mr-2" />
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={deleteColumn}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={addRowBefore}>
                <RowsIcon className="h-4 w-4 mr-2" />
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={addRowAfter}>
                <RowsIcon className="h-4 w-4 mr-2" />
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={deleteRow}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={mergeCells}>
                <Merge className="h-4 w-4 mr-2" />
                Merge Cells
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={splitCell}>
                <Merge className="h-4 w-4 mr-2" rotate={90} />
                Split Cell
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={toggleHeaderRow}>
                <TableIcon className="h-4 w-4 mr-2" />
                Toggle Header Row
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Table Alignment
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={editor.getAttributes("table").textAlign}
                  >
                    <DropdownMenuRadioItem
                      value="left"
                      onSelect={() => setTableAlignment("left")}
                    >
                      <AlignLeft className="h-4 w-4 mr-2" />
                      Left
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="center"
                      onSelect={() => setTableAlignment("center")}
                    >
                      <AlignCenter className="h-4 w-4 mr-2" />
                      Center
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="right"
                      onSelect={() => setTableAlignment("right")}
                    >
                      <AlignRight className="h-4 w-4 mr-2" />
                      Right
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={deleteTable}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <EditorContent editor={editor} className="prose max-w-none py-4" />
      </div>
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          color: white;
        }
        .ProseMirror strong {
          color: white;
        }
        .ProseMirror code {
          color: GreenYellow;
          font-weight: lighter;
        }
        .ProseMirror ul li {
          color: white;
        }
        .ProseMirror ol li {
          color: white;
        }
        .ProseMirror ul li p {
          margin: 0;
        }
        .ProseMirror ol li p {
          margin: 0;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style-type: none;
        }
        .ProseMirror ul[data-type="taskList"] li div {
          display: inline-block;
          margin-left: 0.5rem;
        }
        .ProseMirror h1 {
          color: white;
        }
        .ProseMirror h2 {
          color: white;
        }
        .ProseMirror h3 {
          color: white;
        }
        .ProseMirror h4 {
          color: white;
        }
        .ProseMirror h5 {
          color: white;
        }
        .ProseMirror h6 {
          color: white;
        }
        .ProseMirror:focus {
          box-shadow: 0 0 0 0px rgba(0, 0, 0, 0);
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }
        .ProseMirror blockquote {
          color: white;
        }
        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #475569;
          box-sizing: border-box;
          min-width: 1em;
          padding: 3px 5px;
          position: relative;
          vertical-align: top;
        }
        .ProseMirror th {
          background-color: #1e293b;
          font-weight: bold;
          text-align: left;
        }
        .ProseMirror .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

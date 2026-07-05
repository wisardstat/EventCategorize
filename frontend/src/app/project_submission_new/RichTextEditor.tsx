"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && bodyRef.current) {
      bodyRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, [value]);

  const exec = (cmd: string) => {
    bodyRef.current?.focus();
    document.execCommand(cmd, false);
    if (bodyRef.current) onChange(bodyRef.current.innerHTML);
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" onClick={() => exec("underline")}><u>U</u></button>
        <div className="sep"></div>
        <button type="button" onClick={() => exec("insertUnorderedList")}>&#8801; &bull;</button>
        <button type="button" onClick={() => exec("insertOrderedList")}>&#8801; 1.</button>
      </div>
      <div
        ref={bodyRef}
        className="rte-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  );
}

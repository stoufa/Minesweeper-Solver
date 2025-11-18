import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MinesweeperEditor() {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [board, setBoard] = useState([]);
  const [pen, setPen] = useState(".");
  const [isDrawing, setIsDrawing] = useState(false);
  const boardRef = useRef(null);

  useEffect(() => {
    setBoard(Array.from({ length: rows }, () => Array(cols).fill(".")));
  }, [rows, cols]);

  const handleCellChange = (r, c) => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[r][c] = pen;
      return newBoard;
    });
  };

  const handleDownload = () => {
    const content = board.map(row => row.join("")).join("\n");
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
    const filename = `board_${timestamp}.txt`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const pens = [".", "?", "!", ...Array.from({ length: 9 }, (_, i) => i.toString())];

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Minesweeper Board Editor</h1>

      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          value={rows}
          onChange={e => setRows(Number(e.target.value))}
          className="border rounded p-1 w-20"
          placeholder="Rows"
        />
        <input
          type="number"
          min="1"
          value={cols}
          onChange={e => setCols(Number(e.target.value))}
          className="border rounded p-1 w-20"
          placeholder="Cols"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {pens.map(p => (
          <Button
            key={p}
            onClick={() => setPen(p)}
            variant={pen === p ? "default" : "outline"}
          >
            {p === "." ? "·" : p}
          </Button>
        ))}
      </div>

      <Card className="p-2">
        <CardContent>
          <div
            ref={boardRef}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            className="grid gap-[1px] bg-gray-400"
            style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleCellChange(r, c)}
                  onMouseEnter={() => isDrawing && handleCellChange(r, c)}
                  className="w-[30px] h-[30px] flex items-center justify-center bg-white cursor-pointer select-none text-sm font-mono hover:bg-gray-100"
                >
                  {cell === "." ? "" : cell}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleDownload}>Download Board File</Button>

      <textarea
        readOnly
        className="border rounded p-2 w-[300px] h-[200px] mt-2 font-mono text-sm"
        value={board.map(row => row.join("")).join("\n")}
      />
    </div>
  );
}

"use client";

import { useState, useRef } from "react";

interface ImportResult {
  message: string;
  total_rows: number;
  imported_count: number;
  errors: string[];
}

export default function IdeaTankImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError("กรุณาเลือกไฟล์ Excel (.xlsx, .xls) เท่านั้น");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setImportResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("กรุณาเลือกไฟล์ Excel ก่อนอัปโหลด");
      return;
    }

    setLoading(true);
    setError(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/bulk-import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "การอัปโหลดล้มเหลว");
      }

      const result: ImportResult = await response.json();
      setImportResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    // Download the Excel template file
    const link = document.createElement('a');
    link.href = '/template_import/template_idea_tank.xlsx';
    link.download = 'template_idea_tank.xlsx';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">นำเข้าข้อมูล Idea Tank จาก Excel</h1>
          <button
            onClick={() => window.location.href = "/idea_tank"}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">ดาวน์โหลดเทมเพลต</h2>
          <p className="text-gray-700 mb-3">
            ดาวน์โหลดไฟล์เทมเพลต Excel เพื่อใช้ในการจัดทำข้อมูลสำหรับนำเข้า
          </p>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ดาวน์โหลดเทมเพลต Excel
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">อัปโหลดไฟล์ Excel</h2>
          
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                ไฟล์ที่เลือก: <span className="font-semibold">{file.name}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-4 py-2 rounded ${
                !file || loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {loading ? "กำลังอัปโหลด..." : "อัปโหลดข้อมูล"}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ล้างข้อมูล
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">ผลการนำเข้าข้อมูล</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">จำนวนแถวทั้งหมด</p>
                <p className="text-2xl font-bold text-blue-600">{importResult.total_rows}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">นำเข้าสำเร็จ</p>
                <p className="text-2xl font-bold text-green-600">{importResult.imported_count}</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">มีข้อผิดพลาด</p>
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="text-red-800 font-semibold mb-2">รายการข้อผิดพลาด</h3>
                <ul className="text-red-700 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-semibold">{importResult.message}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
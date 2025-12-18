"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Loader2 } from "lucide-react";
import { cn } from "@/functions";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName?: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  fileName = "report.pdf",
}: PdfViewerModalProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    try {
      // Fetch PDF as blob and create download (works with cross-origin S3 URLs)
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Fallback: try direct link (may open in new tab for cross-origin)
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = fileName;
      a.target = "_blank";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Early return if no URL or modal not open
  if (!isOpen || !pdfUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-[95vw] w-full h-[90vh] p-0 gap-0",
          "sm:max-w-5xl sm:h-[85vh]",
          "flex flex-col"
        )}
      >
        {/* Header with title and actions */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">PDF Report</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="relative flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Failed to load PDF. Please try downloading it instead.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="default">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            key={pdfUrl}
            src={pdfUrl}
            className={cn(
              "w-full h-full border-0",
              isLoading || hasError ? "opacity-0" : "opacity-100"
            )}
            title="PDF Viewer"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ transition: "opacity 0.3s ease-in-out" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


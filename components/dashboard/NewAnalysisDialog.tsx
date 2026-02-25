"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { AnalysisForm } from "@/components/dashboard/AnalysisForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function NewAnalysisDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Analysis
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Analysis Run</DialogTitle>
            <DialogDescription>
              Configure the sources to scrape and analyze. Each source maps to an Apify actor.
            </DialogDescription>
          </DialogHeader>
          <AnalysisForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

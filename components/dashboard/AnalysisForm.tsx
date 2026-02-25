"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { SourceEditor } from "@/components/dashboard/SourceEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AnalyzeFormData, analyzeSchema } from "@/lib/validations";

const DEFAULT_SOURCE = {
  platform: "reddit" as const,
  apify_actor_id: "trudax/reddit-scraper-lite",
  actor_input: JSON.stringify(
    {
      startUrls: [{ url: "https://www.reddit.com/r/all/top/?t=week" }],
      maxItems: 100,
      skipComments: true,
    },
    null,
    2
  ),
};

interface AnalysisFormProps {
  onClose: () => void;
}

export function AnalysisForm({ onClose }: AnalysisFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AnalyzeFormData>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      sources: [DEFAULT_SOURCE],
      time_window: "week",
      max_posts_per_source: 100,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sources",
  });

  async function onSubmit(data: AnalyzeFormData) {
    setSubmitting(true);
    setError(null);

    const payload = {
      sources: data.sources.map((s) => ({
        platform: s.platform,
        apify_actor_id: s.apify_actor_id,
        actor_input: JSON.parse(s.actor_input),
      })),
      time_window: data.time_window,
      max_posts_per_source: data.max_posts_per_source,
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? res.statusText);
      }
      const { run_id } = await res.json();
      onClose();
      router.push(`/runs/${run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <SourceEditor
              key={field.id}
              form={form}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(DEFAULT_SOURCE)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add source
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="time_window"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time window</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="day">Past 24 hours</SelectItem>
                    <SelectItem value="week">Past week</SelectItem>
                    <SelectItem value="month">Past month</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_posts_per_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max posts / source</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Starting…" : "Start analysis"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AnalyzeFormData, analyzeSchema } from "@/lib/validations";

const PLATFORMS = [
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
] as const;

interface AnalysisFormProps {
  onClose: () => void;
}

export function AnalysisForm({ onClose }: AnalysisFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState("trending, viral");

  const form = useForm<AnalyzeFormData>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      platforms: ["reddit", "youtube", "tiktok", "instagram"],
      time_window: "week",
      max_posts_per_source: 25,
      searches: ["trending", "viral"],
    },
  });

  const { field: platformsField } = useController({
    control: form.control,
    name: "platforms",
  });

  function togglePlatform(value: string) {
    const current = platformsField.value as string[];
    const next = current.includes(value)
      ? current.filter((p) => p !== value)
      : [...current, value];
    platformsField.onChange(next);
  }

  function handleSearchChange(raw: string) {
    setSearchInput(raw);
    const terms = raw.split(",").map((s) => s.trim()).filter(Boolean);
    form.setValue("searches", terms, { shouldValidate: true });
  }

  async function onSubmit(data: AnalyzeFormData) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  const selectedPlatforms = platformsField.value as string[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Platforms */}
        <div className="space-y-2">
          <FormLabel>Platforms</FormLabel>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={selectedPlatforms.includes(value) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          {form.formState.errors.platforms && (
            <p className="text-sm text-destructive">
              {form.formState.errors.platforms.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Time window */}
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

          {/* Max posts per source */}
          <FormField
            control={form.control}
            name="max_posts_per_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max posts / source</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Search terms */}
        <div className="space-y-2">
          <FormLabel>Search terms</FormLabel>
          <Input
            placeholder="trending, viral, ..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Comma-separated</p>
          {form.formState.errors.searches && (
            <p className="text-sm text-destructive">
              {form.formState.errors.searches.message}
            </p>
          )}
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

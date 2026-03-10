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
import { Label } from "@/components/ui/label";
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

  const form = useForm<AnalyzeFormData>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      platforms: ["reddit", "youtube", "tiktok", "instagram"],
      time_window: "week",
      max_posts_per_source: 25,
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
          <div className="space-y-2">
            {PLATFORMS.map(({ value, label }) => (
              <div key={value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`platform-${value}`}
                  checked={selectedPlatforms.includes(value)}
                  onChange={() => togglePlatform(value)}
                  className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
                <Label htmlFor={`platform-${value}`} className="cursor-pointer font-normal">
                  {label}
                </Label>
              </div>
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

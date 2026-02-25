"use client";

import { Trash2 } from "lucide-react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
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
import { Textarea } from "@/components/ui/textarea";
import type { AnalyzeFormData } from "@/lib/validations";

const PLATFORM_DEFAULTS: Record<
  string,
  { actor_id: string; actor_input: object }
> = {
  reddit: {
    actor_id: "trudax/reddit-scraper-lite",
    actor_input: {
      startUrls: [{ url: "https://www.reddit.com/r/all/top/?t=week" }],
      maxItems: 100,
      skipComments: true,
    },
  },
  youtube: {
    actor_id: "bernardo/youtube-scraper",
    actor_input: { searchKeywords: ["trending"], maxResults: 50 },
  },
  tiktok: {
    actor_id: "clockworks/tiktok-scraper",
    actor_input: { hashtags: ["trending"], resultsPerPage: 50 },
  },
  instagram: {
    actor_id: "apify/instagram-scraper",
    actor_input: { hashtags: ["trending"], resultsLimit: 50 },
  },
};

interface SourceEditorProps {
  form: UseFormReturn<AnalyzeFormData>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function SourceEditor({ form, index, onRemove, canRemove }: SourceEditorProps) {
  const platform = useWatch({ control: form.control, name: `sources.${index}.platform` });

  function applyDefaults(value: string) {
    const defaults = PLATFORM_DEFAULTS[value];
    if (!defaults) return;
    form.setValue(`sources.${index}.apify_actor_id`, defaults.actor_id);
    form.setValue(
      `sources.${index}.actor_input`,
      JSON.stringify(defaults.actor_input, null, 2)
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3 relative">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Source {index + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name={`sources.${index}.platform`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Platform</FormLabel>
            <Select
              onValueChange={(v) => {
                field.onChange(v);
                applyDefaults(v);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`sources.${index}.apify_actor_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apify Actor ID</FormLabel>
            <FormControl>
              <Input placeholder="e.g. trudax/reddit-scraper-lite" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`sources.${index}.actor_input`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Actor Input (JSON)</FormLabel>
            <FormControl>
              <Textarea
                rows={5}
                className="font-mono text-xs"
                placeholder='{"maxItems": 100}'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// SPDX-License-Identifier: MIT

import { z } from "zod";
import {
  registryIndexSchema,
  registryItemSchema,
  type RegistryIndexEntry,
  type RegistryItem,
} from "./schema.js";

/** Why a registry fetch failed — used to pick a friendly message. */
export type RegistryErrorCode =
  | "NETWORK"
  | "NOT_FOUND"
  | "HTTP"
  | "INVALID_JSON"
  | "INVALID_SCHEMA";

/** A registry failure with a human-readable, actionable message. */
export class RegistryError extends Error {
  readonly code: RegistryErrorCode;
  readonly url: string;

  constructor(code: RegistryErrorCode, url: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RegistryError";
    this.code = code;
    this.url = url;
  }
}

/** Build the URL for a registry item: `{base}/{name}.json`. */
export function registryItemUrl(baseUrl: string, name: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(name)}.json`;
}

/** Build the URL for the registry catalog: `{base}/index.json`. */
export function registryIndexUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/index.json`;
}

/**
 * Fetch a URL and parse the body as JSON, translating every failure mode
 * into a {@link RegistryError} with a friendly message.
 */
async function fetchRegistryJson(url: string, subject: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
    });
  } catch (cause) {
    throw new RegistryError(
      "NETWORK",
      url,
      `Could not reach the registry at ${url}.\n` +
        `Check your network connection and the "registry" URL in commons.json.`,
      { cause },
    );
  }

  if (response.status === 404) {
    throw new RegistryError(
      "NOT_FOUND",
      url,
      `${subject} was not found in the registry (${url}).\n` +
        `Check the spelling, or browse available components at https://commonsui.com/docs/components.`,
    );
  }

  if (!response.ok) {
    throw new RegistryError(
      "HTTP",
      url,
      `The registry responded with HTTP ${response.status} for ${url}.\n` +
        `This is likely a temporary registry problem — try again in a moment.`,
    );
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new RegistryError(
      "INVALID_JSON",
      url,
      `The registry response at ${url} is not valid JSON.\n` +
        `The registry may be misconfigured — please report this at https://github.com/21stgov/commons/issues.`,
      { cause },
    );
  }
}

/**
 * Fetch and validate a registry item from `{baseUrl}/{name}.json`.
 *
 * Throws {@link RegistryError} with a friendly message that distinguishes
 * network failures, missing items (404), other HTTP errors, invalid JSON,
 * and schema mismatches.
 */
export async function fetchRegistryItem(baseUrl: string, name: string): Promise<RegistryItem> {
  const url = registryItemUrl(baseUrl, name);
  const data = await fetchRegistryJson(url, `Component "${name}"`);

  const parsed = registryItemSchema.safeParse(data);
  if (!parsed.success) {
    throw new RegistryError(
      "INVALID_SCHEMA",
      url,
      `The registry item "${name}" (${url}) does not match the expected registry-item schema:\n` +
        `${z.prettifyError(parsed.error)}\n` +
        `The registry may be out of date — please report this at https://github.com/21stgov/commons/issues.`,
    );
  }

  return parsed.data;
}

/**
 * Fetch and validate the searchable catalog from `{baseUrl}/index.json`.
 * Accepts either a bare array of entries or `{ items: [...] }` and always
 * returns the flat entry list.
 */
export async function fetchRegistryIndex(baseUrl: string): Promise<RegistryIndexEntry[]> {
  const url = registryIndexUrl(baseUrl);
  const data = await fetchRegistryJson(url, "The registry catalog (index.json)");

  const parsed = registryIndexSchema.safeParse(data);
  if (!parsed.success) {
    throw new RegistryError(
      "INVALID_SCHEMA",
      url,
      `The registry catalog (${url}) does not match the expected index schema:\n` +
        `${z.prettifyError(parsed.error)}\n` +
        `The registry may be out of date — please report this at https://github.com/21stgov/commons/issues.`,
    );
  }

  return Array.isArray(parsed.data) ? parsed.data : parsed.data.items;
}

import { createRequire } from 'node:module'
import { isEnvDefinedFalsy } from '../../utils/envUtils.js'

export type SyntaxTheme = import('color-diff-napi').SyntaxTheme

export type ColorModuleUnavailableReason = 'env' | 'native'

const require = createRequire(import.meta.url)

type NativeColorModule = {
  ColorDiff: import('color-diff-napi').ColorDiff
  ColorFile: import('color-diff-napi').ColorFile
  getSyntaxTheme: typeof import('color-diff-napi').getSyntaxTheme
}

let cachedNative: NativeColorModule | null | undefined

function loadNativeModule(): NativeColorModule | null {
  if (cachedNative !== undefined) return cachedNative
  try {
    const mod = require('color-diff-napi') as Record<string, unknown>
    if (
      mod &&
      typeof mod.ColorDiff === 'function' &&
      typeof mod.ColorFile === 'function' &&
      typeof mod.getSyntaxTheme === 'function'
    ) {
      cachedNative = mod as NativeColorModule
      return cachedNative
    }
  } catch {
    /* native binary missing or unloadable */
  }
  cachedNative = null
  return null
}

/**
 * Returns a static reason why the color-diff module is unavailable, or null if available.
 * - `env` — disabled via CLAUDE_CODE_SYNTAX_HIGHLIGHT
 * - `native` — NAPI module missing or failed to load (e.g. minimal Docker / headless)
 */
export function getColorModuleUnavailableReason(): ColorModuleUnavailableReason | null {
  if (isEnvDefinedFalsy(process.env.CLAUDE_CODE_SYNTAX_HIGHLIGHT)) {
    return 'env'
  }
  if (!loadNativeModule()) {
    return 'native'
  }
  return null
}

export function expectColorDiff(): NativeColorModule['ColorDiff'] | null {
  return getColorModuleUnavailableReason() === null
    ? loadNativeModule()!.ColorDiff
    : null
}

export function expectColorFile(): NativeColorModule['ColorFile'] | null {
  return getColorModuleUnavailableReason() === null
    ? loadNativeModule()!.ColorFile
    : null
}

export function getSyntaxTheme(themeName: string): SyntaxTheme | null {
  return getColorModuleUnavailableReason() === null
    ? loadNativeModule()!.getSyntaxTheme(themeName)
    : null
}

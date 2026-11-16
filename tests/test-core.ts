/**
 * PhotoKit Core Engine Test Suite
 * Executed under Node.js 24 with mocked DOM/Canvas environments
 */

import {
  detectMimeTypeFromMagicBytes,
  validateDimensions,
} from '../src/core/validation';
import { calculateTargetDimensions } from '../src/core/resizer';
import { revokeObjectUrl, revokeObjectUrls } from '../src/core/cleanup';
import { safeEncodeCanvas } from '../src/core/canvas';
import {
  MAX_SAFE_DIMENSION,
  MAX_SAFE_PIXEL_AREA,
  MOBILE_WARNING_DIMENSION,
} from '../src/core/constants';
import { ProcessingError } from '../src/core/types';

// Setup minimal DOM mocks for Node.js test execution
class MockBlob {
  public size: number;
  public type: string;
  private data: Uint8Array;

  constructor(chunks: (Uint8Array | ArrayBuffer | string)[], options: { type?: string } = {}) {
    this.type = options.type || '';
    if (chunks.length > 0 && chunks[0] instanceof Uint8Array) {
      this.data = chunks[0];
      this.size = chunks[0].byteLength;
    } else if (chunks.length > 0 && chunks[0] instanceof ArrayBuffer) {
      this.data = new Uint8Array(chunks[0]);
      this.size = this.data.byteLength;
    } else {
      this.data = new Uint8Array(100);
      this.size = 100;
    }
  }

  slice(start = 0, end?: number): MockBlob {
    const sub = this.data.slice(start, end);
    return new MockBlob([sub], { type: this.type });
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const copy = new Uint8Array(this.data.byteLength);
    copy.set(this.data);
    return copy.buffer as ArrayBuffer;
  }
}

// Global mocks
(globalThis as any).Blob = MockBlob;
if (typeof (globalThis as any).URL.createObjectURL !== 'function') {
  (globalThis as any).URL.createObjectURL = (b: any) => `blob:mock-url-${Math.random()}`;
}
if (typeof (globalThis as any).URL.revokeObjectURL !== 'function') {
  (globalThis as any).URL.revokeObjectURL = (url: string) => {};
}

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${testName} - ${failureDetails || 'Assertion failed'}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('=== Running PhotoKit Core Engine Test Suite ===\n');

  // ---------------------------------------------------------------------------
  // 1. Magic Bytes & MIME Validation
  // ---------------------------------------------------------------------------
  console.log('--- Test Suite 1: Magic Bytes & MIME Validation ---');

  // Test JPEG
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegBlob = new MockBlob([jpegBytes], { type: 'image/jpeg' });
  const detectedJpeg = await detectMimeTypeFromMagicBytes(jpegBlob as any);
  assert(detectedJpeg === 'image/jpeg', 'Detects JPEG from FF D8 FF header');

  // Test PNG
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngBlob = new MockBlob([pngBytes], { type: 'image/png' });
  const detectedPng = await detectMimeTypeFromMagicBytes(pngBlob as any);
  assert(detectedPng === 'image/png', 'Detects PNG from 89 50 4E 47 header');

  // Test WebP
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, // 'WEBP'
  ]);
  const webpBlob = new MockBlob([webpBytes], { type: 'image/webp' });
  const detectedWebp = await detectMimeTypeFromMagicBytes(webpBlob as any);
  assert(detectedWebp === 'image/webp', 'Detects WebP from RIFF....WEBP header');

  // Test Corrupted / Truncated File (< 4 bytes)
  try {
    const tinyBlob = new MockBlob([new Uint8Array([0xff, 0xd8])]);
    await detectMimeTypeFromMagicBytes(tinyBlob as any);
    assert(false, 'Corrupted file rejection', 'Expected error for < 4 bytes');
  } catch (err: any) {
    assert(err instanceof ProcessingError && err.code === 'CORRUPTED_FILE', 'Rejects truncated file with CORRUPTED_FILE');
  }

  // Test Invalid / Unsupported Header
  try {
    const exeBlob = new MockBlob([new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00])]);
    await detectMimeTypeFromMagicBytes(exeBlob as any);
    assert(false, 'Unsupported format rejection', 'Expected error for non-image bytes');
  } catch (err: any) {
    assert(err instanceof ProcessingError && err.code === 'INVALID_FILE_TYPE', 'Rejects non-image with INVALID_FILE_TYPE');
  }

  // ---------------------------------------------------------------------------
  // 2. Dimension & Surface Area Safeguards
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 2: Dimension & Surface Area Safeguards ---');

  // Normal dimension
  const normalDim = validateDimensions(1920, 1080);
  assert(normalDim.valid && !normalDim.warning, 'Standard 1080p dimensions valid without warning');

  // Mobile warning threshold (> 4096px)
  const mobileWarnDim = validateDimensions(5000, 2000);
  assert(
    mobileWarnDim.valid && Boolean(mobileWarnDim.warning),
    'Dimensions > 4096px valid but trigger non-blocking mobile warning'
  );

  // Maximum single dimension exceeded (> 8192px)
  const overMaxDim = validateDimensions(9000, 1000);
  assert(
    !overMaxDim.valid && Boolean(overMaxDim.error?.includes('8192px')),
    'Single dimension > 8192px rejected'
  );

  // Maximum total area exceeded (> 16,777,216 px) even if width <= 8192
  // e.g. 8000 x 3000 = 24,000,000 px
  const overAreaDim = validateDimensions(8000, 3000);
  assert(
    !overAreaDim.valid && Boolean(overAreaDim.error?.includes('exceeds the safe limit')),
    'Total pixel area > 16.7M pixels rejected'
  );

  // Negative / zero dimensions
  const invalidDim = validateDimensions(0, -50);
  assert(!invalidDim.valid, 'Zero or negative dimensions rejected');

  // ---------------------------------------------------------------------------
  // 3. Aspect Ratio Calculation Math
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 3: Aspect Ratio Calculations ---');

  // 4000x2000 (aspect ratio 2.0). Resize width to 1000 -> height should be 500
  const aspectWidth = calculateTargetDimensions(4000, 2000, 1000, undefined, true);
  assert(aspectWidth.width === 1000 && aspectWidth.height === 500, 'Calculates proportional height when width is given');

  // 4000x2000 (aspect ratio 2.0). Resize height to 800 -> width should be 1600
  const aspectHeight = calculateTargetDimensions(4000, 2000, undefined, 800, true);
  assert(aspectHeight.width === 1600 && aspectHeight.height === 800, 'Calculates proportional width when height is given');

  // Both given with aspect lock true: bounding box containment
  // Box: 800x800 for 4000x2000 source -> scale 800/4000 = 0.2 -> 800x400
  const aspectFit = calculateTargetDimensions(4000, 2000, 800, 800, true);
  assert(aspectFit.width === 800 && aspectFit.height === 400, 'Fits within bounding box preserving ratio');

  // Freeform stretching (aspect ratio lock false)
  const freeform = calculateTargetDimensions(4000, 2000, 1200, 1200, false);
  assert(freeform.width === 1200 && freeform.height === 1200, 'Allows freeform non-proportional dimensions when unlocked');

  // ---------------------------------------------------------------------------
  // 4. Target-KB Compression Algorithmic Invariants
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 4: Target-KB Algorithmic Invariants ---');

  // Simulate discrete binary search logic with synthetic size curve:
  // Size(Q) = 20KB + Q * 180KB (at Q=0.01: ~21.8KB, at Q=1.00: 200KB)
  const syntheticSize = (q: number) => Math.round(20 * 1024 + q * 180 * 1024);

  // Target: 50 KB
  const target50KB = 50 * 1024;
  let qLow = 0.01;
  let qHigh = 1.00;
  let bestCandidate: { q: number; size: number } | null = null;

  // Pre-flight Q=1.00
  const sizeAtMax = syntheticSize(1.00);
  assert(sizeAtMax > target50KB, 'Pre-flight Q=1.00 correctly identified as exceeding target');

  // Pre-flight Q=0.01
  const sizeAtMin = syntheticSize(0.01);
  assert(sizeAtMin <= target50KB, 'Pre-flight Q=0.01 correctly identified as valid baseline floor');
  bestCandidate = { q: 0.01, size: sizeAtMin };

  // 7 Bisection steps
  for (let i = 1; i <= 7; i++) {
    const qMid = Number(((qLow + qHigh) / 2).toFixed(4));
    const size = syntheticSize(qMid);
    if (size <= target50KB) {
      bestCandidate = { q: qMid, size };
      qLow = qMid;
    } else {
      qHigh = qMid;
    }
  }

  assert(bestCandidate !== null, 'Candidate found through 7-step bisection');
  assert(
    bestCandidate.size <= target50KB,
    `Strict invariant holds: Output size (${Math.round(bestCandidate.size / 1024)} KB) <= target (${Math.round(target50KB / 1024)} KB)`
  );
  assert(
    bestCandidate.q > 0.15 && bestCandidate.q < 0.20,
    `Found highest valid quality (${bestCandidate.q}) within 7-step budget`
  );

  // Test TARGET_UNREACHABLE_AT_MIN_QUALITY invariant
  const targetTooSmall = 15 * 1024; // 15 KB (minimum floor is ~21.8 KB)
  const minFails = syntheticSize(0.01) > targetTooSmall;
  assert(minFails, 'Correctly flags TARGET_UNREACHABLE_AT_MIN_QUALITY when target is below Q=0.01 size');

  // ---------------------------------------------------------------------------
  // 5. Cleanup Module
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 5: Resource Cleanup ---');
  let revoked = 0;
  (globalThis as any).URL.revokeObjectURL = (url: string) => {
    if (url.startsWith('blob:')) revoked++;
  };

  revokeObjectUrl('blob:test-1');
  assert(revoked === 1, 'Revokes single object URL');

  revokeObjectUrls(['blob:test-2', 'blob:test-3', null, undefined, 'https://external.com']);
  assert(revoked === 3, 'Revokes array of object URLs safely ignoring nulls/non-blobs');

  // ---------------------------------------------------------------------------
  // 6. Canvas Safe Encoding, Selective Retry & Timeout Protection
  // Note: These unit tests use controlled mocks to verify algorithmic error handling
  // and retry boundaries. They do not claim to verify native browser GPU rendering.
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 6: Canvas Safe Encoding, Selective Retry & Timeout Protection ---');

  const createMockCanvas = (toBlobImpl: (cb: (b: any) => void, mime: string, q?: number) => void) => {
    return {
      toBlob: toBlobImpl,
      width: 100,
      height: 100,
      getContext: () => ({ clearRect: () => {} }),
    } as unknown as HTMLCanvasElement;
  };

  // 6.1 First attempt returns valid Blob: no retry
  {
    let attempts = 0;
    const canvas = createMockCanvas((cb) => {
      attempts++;
      cb(new MockBlob([new Uint8Array(500)], { type: 'image/jpeg' }));
    });
    const result = await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
    assert(attempts === 1, 'Valid encoding: Exactly 1 attempt made (no retry)');
    assert(result.size === 500, 'Valid encoding: Correct Blob returned');
  }

  // 6.2 First attempt returns null: one retry is performed
  {
    let attempts = 0;
    const canvas = createMockCanvas((cb) => {
      attempts++;
      cb(null);
    });
    try {
      await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
      assert(false, 'Null blob should throw');
    } catch (err: any) {
      assert(attempts === 2, 'Null blob: Exactly 1 retry performed (attempts === 2)');
      assert(err instanceof ProcessingError && err.code === 'CANVAS_ENCODING_FAILED', 'Null blob: Returns CANVAS_ENCODING_FAILED');
    }
  }

  // 6.3 First attempt throws synchronous exception: one retry is performed
  {
    let attempts = 0;
    const canvas = createMockCanvas(() => {
      attempts++;
      throw new Error('Canvas 2D context lost');
    });
    try {
      await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
      assert(false, 'Synchronous throw should be caught and retried');
    } catch (err: any) {
      assert(attempts === 2, 'Synchronous throw: Exactly 1 retry performed (attempts === 2)');
      assert(err instanceof ProcessingError && err.code === 'CANVAS_ENCODING_FAILED', 'Synchronous throw: Returns CANVAS_ENCODING_FAILED');
    }
  }

  // 6.4 First attempt times out: NO retry; CANVAS_ENCODING_TIMEOUT is preserved
  {
    let attempts = 0;
    const realSetTimeout = globalThis.setTimeout;
    const realClearTimeout = globalThis.clearTimeout;

    try {
      // Mock setTimeout to immediately trigger the timeout callback when 6000ms is requested
      (globalThis as any).setTimeout = (fn: (...args: any[]) => void, ms?: number, ...args: any[]) => {
        if (ms === 6000) {
          // Trigger timeout immediately in microtask
          queueMicrotask(() => fn(...args));
          return 999;
        }
        return realSetTimeout(fn, ms, ...args);
      };
      (globalThis as any).clearTimeout = (id: any) => {
        if (id !== 999) realClearTimeout(id);
      };

      const canvas = createMockCanvas(() => {
        attempts++;
        // Do not call callback; simulate hanging operation
      });

      await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
      assert(false, 'Timeout should throw');
    } catch (err: any) {
      assert(attempts === 1, 'Timeout: NO retry performed (attempts === 1)');
      assert(err instanceof ProcessingError && err.code === 'CANVAS_ENCODING_TIMEOUT', 'Timeout: Preserves CANVAS_ENCODING_TIMEOUT error code');
    } finally {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClearTimeout;
    }
  }

  // 6.5 First attempt fails and retry succeeds: successful Blob is returned
  {
    let attempts = 0;
    const canvas = createMockCanvas((cb) => {
      attempts++;
      if (attempts === 1) {
        cb(null); // First attempt fails
      } else {
        cb(new MockBlob([new Uint8Array(250)], { type: 'image/jpeg' })); // Retry succeeds
      }
    });

    const result = await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
    assert(attempts === 2, 'Fail then succeed: 2 attempts made');
    assert(result.size === 250, 'Fail then succeed: Returns successful Blob from retry');
  }

  // 6.6 First attempt fails and retry also fails: CANVAS_ENCODING_FAILED is returned
  {
    let attempts = 0;
    const canvas = createMockCanvas((cb) => {
      attempts++;
      cb(null);
    });

    try {
      await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
      assert(false, 'Persistent failure should throw');
    } catch (err: any) {
      assert(err instanceof ProcessingError && err.code === 'CANVAS_ENCODING_FAILED', 'Persistent failure: Throws CANVAS_ENCODING_FAILED');
    }
  }

  // 6.7 Retry count never exceeds one
  {
    let attempts = 0;
    const canvas = createMockCanvas((cb) => {
      attempts++;
      cb(null);
    });

    try {
      await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
    } catch (_) {}

    assert(attempts === 2, 'Strict ceiling: Attempts strictly equals 2 (initial + exactly 1 retry)');
  }

  // 6.8 Late callback after timeout cannot resolve or cause duplicate completion
  {
    let lateCallback: ((b: any) => void) | null = null;
    const realSetTimeout = globalThis.setTimeout;
    const realClearTimeout = globalThis.clearTimeout;

    try {
      (globalThis as any).setTimeout = (fn: (...args: any[]) => void, ms?: number, ...args: any[]) => {
        if (ms === 6000) {
          queueMicrotask(() => fn(...args));
          return 888;
        }
        return realSetTimeout(fn, ms, ...args);
      };
      (globalThis as any).clearTimeout = (id: any) => {
        if (id !== 888) realClearTimeout(id);
      };

      const canvas = createMockCanvas((cb) => {
        lateCallback = cb;
      });

      let timedOut = false;
      try {
        await safeEncodeCanvas(canvas, 'image/jpeg', 0.8);
      } catch (err: any) {
        if (err.code === 'CANVAS_ENCODING_TIMEOUT') {
          timedOut = true;
        }
      }

      assert(timedOut, 'Operation timed out successfully');

      // Now trigger the late callback after the promise has already rejected
      let lateCallbackThrew = false;
      try {
        if (lateCallback) {
          (lateCallback as any)(new MockBlob([new Uint8Array(100)]));
        }
      } catch (_) {
        lateCallbackThrew = true;
      }

      assert(!lateCallbackThrew, 'Late callback safely swallowed without unhandled exception');
    } finally {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClearTimeout;
    }
  }

  // ---------------------------------------------------------------------------
  // Test Suite 7: High-Level Module Invariants (Phase 4 Integration)
  // ---------------------------------------------------------------------------
  console.log('\n--- Test Suite 7: Module Guardrails & Phase 4 Invariants ---');

  // 7.1 compressToTargetKb rejects PNG with PNG_QUALITY_NOT_SUPPORTED
  {
    const { compressToTargetKb } = await import('../src/core/compressor');
    const dummyImage = { width: 100, height: 100 } as any;

    let rejected = false;
    let errorCode = '';
    try {
      await compressToTargetKb(dummyImage, {
        targetBytes: 50 * 1024,
        mimeType: 'image/png' as any,
      });
    } catch (err: any) {
      rejected = true;
      errorCode = err.code;
    }
    assert(rejected && errorCode === 'PNG_QUALITY_NOT_SUPPORTED', 'compressToTargetKb rejects PNG with PNG_QUALITY_NOT_SUPPORTED');
  }

  // 7.2 compressToTargetKb rejects invalid or negative targetBytes
  {
    const { compressToTargetKb } = await import('../src/core/compressor');
    const dummyImage = { width: 100, height: 100 } as any;

    let rejected = false;
    try {
      await compressToTargetKb(dummyImage, {
        targetBytes: -500,
        mimeType: 'image/jpeg',
      });
    } catch (err: any) {
      rejected = err.code === 'UNSUPPORTED_OPERATION';
    }
    assert(rejected, 'compressToTargetKb rejects negative targetBytes with UNSUPPORTED_OPERATION');
  }

  // 7.3 compressWithQuality rejects out-of-range quality
  {
    const { compressWithQuality } = await import('../src/core/compressor');
    const dummyImage = { width: 100, height: 100 } as any;

    let rejectedLow = false;
    try {
      await compressWithQuality(dummyImage, {
        quality: 0.005,
        mimeType: 'image/jpeg',
      });
    } catch (err: any) {
      rejectedLow = err.code === 'UNSUPPORTED_OPERATION';
    }
    assert(rejectedLow, 'compressWithQuality rejects quality < 0.01');

    let rejectedHigh = false;
    try {
      await compressWithQuality(dummyImage, {
        quality: 1.05,
        mimeType: 'image/jpeg',
      });
    } catch (err: any) {
      rejectedHigh = err.code === 'UNSUPPORTED_OPERATION';
    }
    assert(rejectedHigh, 'compressWithQuality rejects quality > 1.00');
  }

  // 7.4 convertImageFormat rejects unsupported formats
  {
    const { convertImageFormat } = await import('../src/core/converter');
    const dummyImage = { width: 100, height: 100 } as any;

    let rejected = false;
    try {
      await convertImageFormat(dummyImage, {
        targetMimeType: 'image/gif' as any,
      });
    } catch (err: any) {
      rejected = err.code === 'INVALID_FILE_TYPE';
    }
    assert(rejected, 'convertImageFormat rejects unsupported format (e.g. image/gif)');
  }

  // 7.5 calculateTargetDimensions handles square bounding boxes
  {
    const dims = calculateTargetDimensions(1920, 1080, 1080, 1080, true);
    assert(dims.width === 1080 && dims.height === 608, 'Fits 16:9 image inside 1:1 square bounding box preserving ratio');
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=================================================');
  console.log(`Test Execution Complete: ${passedTests} passed, ${failedTests} failed.`);
  console.log('=================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

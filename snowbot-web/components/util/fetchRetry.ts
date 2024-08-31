// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import picocolors from 'picocolors';
import retry from 'async-retry';

// retry settings
const MIN_TIMEOUT = 10;
const MAX_RETRIES = 5;
const MAX_RETRY_AFTER = 20;
const FACTOR = 6;

function isClientError(err: any): err is NodeJS.ErrnoException {
  if (!err) return false;
  return (
    err.code === 'ERR_UNESCAPED_CHARACTERS'
    || err.message === 'Request path contains unescaped characters'
  );
}

export class ResponseError extends Error {
  readonly res: Response;
  readonly code: number;
  readonly statusCode: number;
  readonly url: string;

  constructor(res: Response) {
    super(res.statusText);

    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, ResponseError);
    }

    this.name = this.constructor.name;
    this.res = res;
    this.code = res.status;
    this.statusCode = res.status;
    this.url = res.url;
  }
}

interface FetchRetryOpt {
  minTimeout?: number,
  retries?: number,
  factor?: number,
  maxRetryAfter?: number,
  retry?: number,
  onRetry?: (err: Error) => void
}

function createFetchRetry($fetch: typeof fetch): typeof fetch {
  const fetchRetry = async (url: string | URL, opts: RequestInit & { retry?: FetchRetryOpt } = {}) => {
    const retryOpts = Object.assign(
      {
        // timeouts will be [10, 60, 360, 2160, 12960]
        // (before randomization is added)
        minTimeout: MIN_TIMEOUT,
        retries: MAX_RETRIES,
        factor: FACTOR,
        maxRetryAfter: MAX_RETRY_AFTER
      },
      opts.retry
    );

    try {
      return await retry(async (bail: any) => {
        try {
          // this will be retried
          const res = (await $fetch(url, opts)) as Response;

          if ((res.status >= 500 && res.status < 600) || res.status === 429 || res.status === 404) {
            // NOTE: doesn't support http-date format
            const retryAfterHeader = res.headers.get('retry-after');
            if (retryAfterHeader) {
              const retryAfter = Number.parseInt(retryAfterHeader, 10);
              if (retryAfter) {
                if (retryAfter > retryOpts.maxRetryAfter) {
                  return res;
                }
                await await new Promise(resolve => setTimeout(resolve, 1e3 * retryAfter));
              }
            }
            else {
              await await new Promise(resolve => setTimeout(resolve, 1e3 * 2));
            }
            throw new ResponseError(res);
          } else {
            await await new Promise(resolve => setTimeout(resolve, 1e3 * 2));
            return res;
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            if (
              err.name === 'AbortError'
              || ('digest' in err && err.digest === 'AbortError')
            ) {
              console.log(picocolors.gray('[fetch abort]'), picocolors.gray(url.toString()));
              return bail(err);
            }
          }
          if (isClientError(err)) {
            return bail(err);
          }
          throw err;
        }
      }, retryOpts);
    } catch (err) {
      if (err instanceof ResponseError) {
        return err.res;
      }
      throw err;
    }
  };

  for (const k of Object.keys($fetch)) {
    const key = k as keyof typeof $fetch;
    fetchRetry[key] = $fetch[key];
  }

  return fetchRetry as typeof fetch;
}

export const fetchWithRetry = createFetchRetry(fetch);
// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { Box, Link, Typography } from "@mui/material";

export function SlateFooter({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: 1,
                py: 2,
                bgcolor: "background.paper"
            }}>            
            <Box sx={{ display: 'flex', gap: 2, px: 4 }}>
                <Box sx={{ color: "text.primary" }}>
                    <Link href="/Privacy Policy.pdf" target="_blank" rel="noopener noreferrer">
                        Privacy Policy [Needs uploaded]
                    </Link>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, color: "text.primary" }}>|</Box>
                <Box sx={{ color: "text.primary" }}>
                    <Link href="/Terms & Conditions of Service.pdf" target="_blank" rel="noopener noreferrer">
                        Terms of Service [Needs uploaded]
                    </Link>
                </Box>
                {children}
            </Box>
        </Box>
    );
}
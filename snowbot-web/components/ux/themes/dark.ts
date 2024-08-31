// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { ThemeOptions } from "@mui/material";
import { deepOrange, grey, blue } from "@mui/material/colors";
import commonStyles from "./common";

const components = {
  MuiLink: {
    styleOverrides: {
      root: {
        color: 'inherit',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        padding: '8px 16px',
        fontSize: '1rem',
        fontWeight: 500,
        textDecoration: 'none',
        '&:hover': {
          color: '#60A5FA',
          // backgroundColor: '#374151',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        margin: 10,
        '& label.Mui-focused': {
          color: 'white',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: '#1e293b',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#1F293B',
          },
          '&:hover fieldset': {
            borderColor: '#1F293B',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1F293B',
          },
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        color: 'white',
        '&:hover': {
          backgroundColor: '#1F293B',
          '&:hover': {
            color: '#60A5FA',
          },
        },
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        color: 'white',
        '&:hover': {
          backgroundColor: '#1F293B',
          '&:hover': {
            color: '#60A5FA',
          },
        },
      },
    },
  }
}


export const darkTheme: ThemeOptions = {
  ...commonStyles,
  palette: {
    mode: 'dark',
    primary: {
      main: blue[900],
    },
    background: {
      default: "#1e293b",
      paper: "#111827",
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  
  },
  components: {
    ...components
  }
};
// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { ThemeOptions } from "@mui/material";
import { red, grey } from "@mui/material/colors";
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
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        margin: 10,
        '& label.Mui-focused': {
          color: 'black',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: '#f5f5f5',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#f5f5f5',
          },
          '&:hover fieldset': {
            borderColor: '#f5f5f5',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#f5f5f5',
          },
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        color: 'black',
        '&:hover': {
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
        color: 'black',
        '&:hover': {
          '&:hover': {
            color: '#60A5FA',
          },
        },
      },
    },
  }
}


export const lightTheme: ThemeOptions = {
  ...commonStyles,

  palette: {
    mode: 'light',
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: '#03DAC5',
    },
    background: {
      default: '#f5f5f5'  ,
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },

  components: {
    ...components
  }
};
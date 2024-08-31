// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import axios from "axios";
import React, { createContext, useContext } from "react";

type AxiosContextType = {
  put: (route: string, body?: any) => Promise<any>;
  post: (route: string, body?: any) => Promise<any>;
  get: (route: string) => Promise<any>;
  del: (route: string) => Promise<any>;
}

const instance = axios.create({
  baseURL: `/api/`,
  withCredentials: true,
});

const defaultContext : AxiosContextType = {
  post: async (route: string, body = {}) => {
    return await instance
    .post(`${route}`, body)
    .then(({ data }) => {
        return data;
    })
    .catch((error) => {
        throw error;
    });
},

put: async (route: string, body = {}) => {
  return await instance
  .put(`${route}`, body)
  .then(({ data }) => {
      return data;
  })
  .catch((error) => {
      throw error;
  });
},

get: async (route: string) => {
  return await instance
    .get(`${route}`)
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      throw error;
    });
},

del: async (route: string) => {
  return await instance
    .delete(`${route}`)
    .then(({ data }) => {
      return data;
    })
    .catch((error) => {
      throw error;
    });
}
};

export const AxiosContext = createContext(defaultContext);

const AxiosProvider = ({ children } : any) => {
    return (<AxiosContext.Provider value={defaultContext}>{children}</AxiosContext.Provider>);
}

const useAxios = () => useContext(AxiosContext);
export { AxiosProvider, useAxios };
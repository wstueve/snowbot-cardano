// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import UserProfilePic from "./UserProfilePic";
import { useAuthenticatedUser } from "../providers/user";
import { useAxios } from "../providers/axios";
import useSWR from "swr";
import {Typography} from "@mui/material";

const UserProfile = () => {
  const authenticatedUser = useAuthenticatedUser();
  const { get } = useAxios();
  const { data, error, isLoading } = useSWR("user", get);

  if (error) {
    return (<div>User Profile: ERR</div>)
  }  
  return (<div className="flex items-center user-profile">
      <UserProfilePic url={!isLoading ? data.image : ""} />
      <Typography className="ml-2 font-medium">{!isLoading ? data.name : ""}</Typography>
      <button
        onClick={authenticatedUser?.handleLogout}
        className="ml-4 pl-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full"
      >
        <FaSignOutAlt />
      </button>
    </div>
  );
};

export default UserProfile;

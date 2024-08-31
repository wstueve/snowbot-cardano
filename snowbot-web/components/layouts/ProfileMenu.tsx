// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { useState } from "react";
import useSWR from 'swr';
import { useAxios } from '../providers/axios';
import { IconButton, Menu, MenuItem, Box, Typography } from '@mui/material';
import { useAuthenticatedUser } from '../providers/user'
import UserProfilePic from "../user/UserProfilePic";

export default function ProfileMenu({ children }: { children: React.ReactNode }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const { get } = useAxios();
    const authenticatedUser = useAuthenticatedUser();

    const { data, error, isLoading } = useSWR("user", get);

    const handleProfileMenu = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseProfileMenu = () => {
        setAnchorEl(null);
    };

    const signOutUser = () => {
        authenticatedUser?.handleLogout();
    }
    
    return (
        <Box>
            <Menu
                sx={{ mt: 7 }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseProfileMenu}
            >
                {/* Profile dropdown */}
                <MenuItem onClick={signOutUser}>Sign Out</MenuItem>
                {/* Add more menu items here */}
            </Menu>
            <IconButton
                sx={{ ml: 1 }}
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                color="inherit"
            >
                <UserProfilePic url={!isLoading ? data.image : ""} />
            </IconButton>
        </Box>

    )
}
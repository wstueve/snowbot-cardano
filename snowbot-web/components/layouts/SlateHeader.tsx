// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { faBank, faGift, faUserGear, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, List, ListItem, Link as MuiLink, Toolbar } from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import useSWR from 'swr';
import { FeatureFlagsJson } from '../metadata/featureFlags';
import { useAxios } from '../providers/axios';
import { useAuthenticatedUser } from '../providers/user';
import UserProfile from '../user/userProfile';
import UserBoost from '../ux/rewards/UserBoost';
import { SwitchThemeButton } from '../ux/theme/SwitchThemeButton';
import ProfileMenu from './ProfileMenu';


function useMobileView() {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile;
}

export default function Navbar({ children }: { children: React.ReactNode }) {
    const authenticatedUser = useAuthenticatedUser();
    const { get } = useAxios();
    const { data: featureFlags }: { data: FeatureFlagsJson } = useSWR("featureFlags", get);
    const isMobile = useMobileView();

    const [mobileOpen, setMobileOpen] = useState(false);



    const handleDrawerToggle = () => {
        console.log('handleDrawerToggle');
        setMobileOpen(!mobileOpen);
    };

    const mobileMenu = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <UserProfile />

            <List>
                {/* Mobile NavBar links */}
                <div className="space-y-1 px-2 pb-3 pt-2">
                    <ListItem>
                        <Link
                            key="Wallets"
                            href="/member"
                            onClick={() => close()}
                        >
                            <MuiLink>
                                <FontAwesomeIcon icon={faWallet} className="mr-2" />
                                Wallets
                            </MuiLink>
                        </Link>
                    </ListItem>
                    <ListItem>
                        <Link
                            key="Rewards"
                            href="/member/rewards"
                            onClick={() => close()}
                        >
                            <MuiLink>
                                <FontAwesomeIcon icon={faGift} className="mr-2" />
                                Rewards
                            </MuiLink>
                        </Link>
                    </ListItem>
                    <ListItem>
                        {featureFlags?.withdrawals && <Link
                            key="Balances"
                            href="/member/balances"
                            onClick={() => close()}
                        >
                            <MuiLink>
                                <FontAwesomeIcon icon={faBank} className="mr-2" />
                                Balances
                            </MuiLink>
                        </Link>}
                    </ListItem>
                    <ListItem>
                        {authenticatedUser?.isAdmin() && <Link
                            key="Admin"
                            href="/member/admin"
                            onClick={() => close()}
                        >
                            <MuiLink>
                                <FontAwesomeIcon icon={faUserGear} className="mr-2" />
                                Admin
                            </MuiLink>
                        </Link>}
                    </ListItem>
                </div>
                {/* Add more list items here */}
            </List>
        </Box>
    );

    const desktonNavbar = (
        <Box sx={{ flexGrow: 1 }}>
            {/* Desktop NavBar links */}
            <Link
                key="Wallets"
                href="/member">
                <MuiLink>
                    <FontAwesomeIcon icon={faWallet} className="mr-2" />
                    Wallets
                </MuiLink>

            </Link>
            <Link
                key="Rewards"
                href="/member/rewards">
                <MuiLink>
                    <FontAwesomeIcon icon={faGift} className="mr-2" />
                    Rewards
                </MuiLink>

            </Link>
            {featureFlags?.withdrawals && <Link
                key="Balances"
                href="/member/balances"
            >
                <MuiLink><FontAwesomeIcon icon={faBank} className="mr-2" />
                    Balances</MuiLink>

            </Link>}
            {authenticatedUser?.isAdmin() && <Link
                key="Admin"
                href="/member/admin"
            >
                <MuiLink>
                    <FontAwesomeIcon icon={faUserGear} className="mr-2" />
                    Admin
                </MuiLink>

            </Link>}
        </Box>
    )

    return (
        <Box>
            <AppBar position="static">
                <Toolbar sx={{bgcolor: "background.paper"}}>
                    {
                        isMobile &&
                        <Box sx={{ flexGrow: 1 }}>
                            <IconButton
                                size="large"
                                edge="start"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    }

                    {!isMobile && (
                        <>
                            {desktonNavbar}
                            {authenticatedUser?.user?.name}<ProfileMenu children={children} />
                        </>
                    )}
                    <UserBoost />
                    <SwitchThemeButton />

                </Toolbar>
            </AppBar>
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    {mobileMenu}
                </Drawer>
            </Box>
            {children}
        </Box>
    );
}

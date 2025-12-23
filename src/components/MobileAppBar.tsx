import React from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface MobileAppBarProps {
    /** Page title to display */
    title?: string;
    /** Callback when hamburger menu is clicked */
    onMenuClick: () => void;
    /** Optional actions to display on the right */
    actions?: React.ReactNode;
    /** Breakpoint for showing/hiding AppBar */
    mobileBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * MobileAppBar Component
 *
 * A mobile-only top app bar that:
 * - Shows only on mobile (hidden on desktop)
 * - Displays hamburger menu icon
 * - Shows page title
 * - Supports optional action buttons
 * - Includes safe-area padding for iOS notch
 *
 * Usage:
 * ```tsx
 * <MobileAppBar
 *   title="Chat"
 *   onMenuClick={() => setDrawerOpen(true)}
 *   actions={<UserMenu />}
 * />
 * ```
 */
const MobileAppBar: React.FC<MobileAppBarProps> = ({
    title,
    onMenuClick,
    actions,
    mobileBreakpoint = "md",
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));

    // Don't render on desktop
    if (!isMobile) {
        return null;
    }

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                // Safe area padding for iOS notch
                paddingTop: "env(safe-area-inset-top)",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: { xs: 56, sm: 64 },
                    px: { xs: 1, sm: 2 },
                }}
            >
                {/* Hamburger Menu */}
                <IconButton
                    color="inherit"
                    aria-label="Open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        minWidth: 44,
                        minHeight: 44,
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Page Title */}
                {title && (
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        }}
                    >
                        {title}
                    </Typography>
                )}

                {/* Optional Actions */}
                {actions && <Box sx={{ ml: "auto" }}>{actions}</Box>}
            </Toolbar>
        </AppBar>
    );
};

export default MobileAppBar;

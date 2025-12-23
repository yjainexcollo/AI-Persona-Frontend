import React from "react";
import {
    Drawer,
    Box,
    IconButton,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ResponsiveDrawerProps {
    /** Whether the drawer is open (controlled) */
    open: boolean;
    /** Callback when drawer should close */
    onClose: () => void;
    /** Drawer content */
    children: React.ReactNode;
    /** Drawer width on desktop */
    drawerWidth?: number;
    /** Breakpoint for mobile/desktop switch */
    mobileBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * ResponsiveDrawer Component
 *
 * A responsive drawer that:
 * - Shows as permanent sidebar on desktop
 * - Shows as temporary overlay drawer on mobile
 * - Handles mobile/desktop transitions automatically
 *
 * Usage:
 * ```tsx
 * <ResponsiveDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
 *   <YourSidebarContent />
 * </ResponsiveDrawer>
 * ```
 */
const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
    open,
    onClose,
    children,
    drawerWidth = 280,
    mobileBreakpoint = "md",
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));

    return (
        <>
            {/* Mobile: Temporary drawer with overlay */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={onClose}
                    ModalProps={{
                        keepMounted: true, // Better mobile performance
                    }}
                    sx={{
                        display: { xs: "block", [mobileBreakpoint]: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: { xs: "86vw", sm: drawerWidth },
                            maxWidth: "100vw",
                        },
                    }}
                >
                    {/* Close button for mobile */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            p: 1,
                        }}
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{
                                minWidth: 44,
                                minHeight: 44,
                            }}
                            aria-label="Close drawer"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {children}
                </Drawer>
            ) : (
                /* Desktop: Permanent drawer */
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: "none", [mobileBreakpoint]: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            position: "relative",
                        },
                    }}
                >
                    {children}
                </Drawer>
            )}
        </>
    );
};

export default ResponsiveDrawer;

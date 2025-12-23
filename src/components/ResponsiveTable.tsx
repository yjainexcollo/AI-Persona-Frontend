import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    Stack,
} from "@mui/material";

interface Column {
    /** Column identifier */
    id: string;
    /** Column header label */
    label: string;
    /** Column width (optional) */
    width?: string | number;
    /** Render function for cell content */
    render?: (row: any) => React.ReactNode;
    /** Hide column on mobile */
    hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
    /** Table columns configuration */
    columns: Column[];
    /** Table data rows */
    data: any[];
    /** Key field for row identification */
    rowKey: string;
    /** Breakpoint for mobile/desktop switch */
    mobileBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Custom card renderer for mobile (optional) */
    renderMobileCard?: (row: any, index: number) => React.ReactNode;
}

/**
 * ResponsiveTable Component
 *
 * A responsive table that:
 * - Shows as standard table on desktop
 * - Converts to cards on mobile for better UX
 * - Supports custom mobile card rendering
 * - Handles column visibility on different screen sizes
 *
 * Usage:
 * ```tsx
 * <ResponsiveTable
 *   columns={[
 *     { id: 'name', label: 'Name' },
 *     { id: 'email', label: 'Email', hideOnMobile: true },
 *     { id: 'status', label: 'Status' },
 *   ]}
 *   data={users}
 *   rowKey="id"
 * />
 * ```
 */
const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
    columns,
    data,
    rowKey,
    mobileBreakpoint = "sm",
    renderMobileCard,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));

    // Default mobile card renderer
    const defaultMobileCard = (row: any, index: number) => (
        <Card
            key={row[rowKey] || index}
            sx={{
                mb: 2,
                "&:last-child": { mb: 0 },
            }}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    {columns
                        .filter((col) => !col.hideOnMobile)
                        .map((col) => (
                            <Box key={col.id}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                                >
                                    {col.label}
                                </Typography>
                                <Typography variant="body2">
                                    {col.render ? col.render(row) : row[col.id]}
                                </Typography>
                            </Box>
                        ))}
                </Stack>
            </CardContent>
        </Card>
    );

    // Mobile view: Cards
    if (isMobile) {
        return (
            <Box sx={{ width: "100%" }}>
                {data.map((row, index) =>
                    renderMobileCard
                        ? renderMobileCard(row, index)
                        : defaultMobileCard(row, index)
                )}
            </Box>
        );
    }

    // Desktop view: Table
    return (
        <TableContainer
            component={Paper}
            sx={{
                width: "100%",
                overflowX: "auto",
            }}
        >
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell
                                key={col.id}
                                sx={{
                                    width: col.width,
                                    fontWeight: 600,
                                }}
                            >
                                {col.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow
                            key={row[rowKey] || index}
                            sx={{
                                "&:last-child td, &:last-child th": { border: 0 },
                            }}
                        >
                            {columns.map((col) => (
                                <TableCell key={col.id}>
                                    {col.render ? col.render(row) : row[col.id]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ResponsiveTable;

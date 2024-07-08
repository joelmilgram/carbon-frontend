import React, { useEffect, useState } from 'react';
import { AspectRatio, Column, OverflowMenu, OverflowMenuItem, Popover, PopoverContent, IconButton } from '@carbon/react';
import { Documentation } from '@carbon/pictograms-react';
import { Close } from '@carbon/react/icons';

export const DocumentMap = ({ rows }) => {
    const [openPopoverTable, setOpenPopoverTable] = useState([]);

    useEffect(() => {
        setOpenPopoverTable(new Array(rows.length).fill(false));
    }, [rows]);

    const displayPopoverTable = (index, open) => {
        const newOpenPopoverTable = openPopoverTable.map((item, i) => (i === index ? open : false));
        setOpenPopoverTable(newOpenPopoverTable);
    }

    return (
        <>
            {rows.map((row, i) => (<Column key={i} lg={3} md={2} sm={2} >
                <AspectRatio className="card" ratio="4x3">
                    <div className="card-header" >
                        <Documentation style={{ padding: "0.5rem" }} />
                        <OverflowMenu className="card-menu">
                            <OverflowMenuItem itemText="Edit" />
                            <OverflowMenuItem hasDivider isDelete itemText="Delete" />
                        </OverflowMenu>
                    </div>
                    <div className="card-name">{row?.name}</div>
                    {(row.detail && row.detail.length > 0) && (
                        <>
                            <div className="card-description">
                                <ul>
                                    {row.detail.map((detail, j) => (
                                        <li key={j}>{detail.msg}/{detail.type}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </AspectRatio>
            </Column>
            ))}
        </>
    );
};

export default DocumentMap;

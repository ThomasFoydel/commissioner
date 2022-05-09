import { getChainById, useEthers } from "@usedapp/core";
import React from "react";

interface props {
    tx: string;
    label: string;
}

const ExplorerLink = (props: props) => {
    const { tx, label } = props;
    const { chainId } = useEthers();
    const chain = getChainById(Number(chainId));

    return (
        <>
            {chain && (
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={chain.getExplorerTransactionLink(tx)}
                    style={{
                        color: "red",
                        textOverflow: "ellipsis",
                        width: "100%",
                        display: "block",
                        overflow: "hidden",
                    }}
                >
                    {label ? label : tx}
                </a>
            )}
        </>
    );
};

export default ExplorerLink;

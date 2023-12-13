import { FC } from "react";

export interface NetworkStatusProps {
    size?: number;
    state: "connected" | "unstable" | "disconnected";
}

export const NetworkStatus: FC<NetworkStatusProps> = (props) => {

    const { size = 20, state } = props;

    switch (state) {
        case "connected":
            return (
                <div className="orderly-flex orderly-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={`${size}px`}
                        height={`${size}px`}
                    >
                        <path d="M13.1611 13.1186C12.3969 12.2297 11.2643 11.6667 10.0001 11.6667C8.73593 11.6667 7.60325 12.2297 6.83911 13.1186" stroke="#27DEC8" stroke-width="1.66667" />
                        <path d="M15.5231 10.7593C14.1523 9.26796 12.1853 8.33331 9.99996 8.33331C7.81463 8.33331 5.8476 9.26796 4.47681 10.7593" stroke="#27DEC8" stroke-width="1.66667" />
                        <path d="M18.1742 8.10357C16.1235 5.93578 13.2198 4.58331 10.0002 4.58331C6.78057 4.58331 3.87686 5.93578 1.82617 8.10357" stroke="#27DEC8" stroke-width="1.66667" />
                        <path d="M11.4732 14.7769C11.2798 14.5834 11.0501 14.43 10.7973 14.3253C10.5446 14.2206 10.2737 14.1667 10.0001 14.1667C9.72649 14.1667 9.45559 14.2206 9.20282 14.3253C8.95006 14.43 8.7204 14.5834 8.52694 14.7769L10.0001 16.25L11.4732 14.7769Z" fill="#27DEC8" />
                    </svg>
                    <span className="orderly-text-success-light orderly-text-xs">Operational</span>
                </div>
            );
        case "unstable":
            return (
                <div className="orderly-flex orderly-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={`${size}px`}
                        height={`${size}px`}
                    >
                        <path d="M13.1613 13.1186C12.3972 12.2297 11.2645 11.6667 10.0003 11.6667C8.73617 11.6667 7.6035 12.2297 6.83936 13.1186" stroke="#FFCF73" stroke-width="1.66667" />
                        <path d="M15.5229 10.7593C14.1521 9.26798 12.185 8.33334 9.99972 8.33334C7.81439 8.33334 5.84736 9.26798 4.47656 10.7593" stroke="white" stroke-opacity="0.2" stroke-width="1.66667" />
                        <path d="M18.1742 8.1036C16.1235 5.9358 13.2198 4.58334 10.0002 4.58334C6.78057 4.58334 3.87686 5.9358 1.82617 8.1036" stroke="white" stroke-opacity="0.2" stroke-width="1.66667" />
                        <path d="M11.473 14.7769C11.2795 14.5834 11.0499 14.4299 10.7971 14.3252C10.5443 14.2206 10.2734 14.1667 9.99984 14.1667C9.72625 14.1667 9.45534 14.2206 9.20258 14.3252C8.94982 14.4299 8.72015 14.5834 8.5267 14.7769L9.99984 16.25L11.473 14.7769Z" fill="#FFCF73" />
                    </svg>
                    <span className="orderly-text-warning orderly-text-xs">Unstable</span>
                </div>
            );
        case "disconnected":
            return (
                <div className="orderly-flex orderly-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={`${size}px`}
                        height={`${size}px`}
                    >
                        <path d="M13.1613 13.1186C12.3972 12.2297 11.2645 11.6667 10.0003 11.6667C8.73617 11.6667 7.6035 12.2297 6.83936 13.1186" stroke="white" stroke-opacity="0.2" stroke-width="1.66667" />
                        <path d="M15.5229 10.7593C14.1521 9.26798 12.185 8.33333 9.99972 8.33333C7.81439 8.33333 5.84736 9.26798 4.47656 10.7593" stroke="white" stroke-opacity="0.2" stroke-width="1.66667" />
                        <path d="M18.1742 8.10359C16.1235 5.9358 13.2198 4.58333 10.0002 4.58333C6.78057 4.58333 3.87686 5.9358 1.82617 8.10359" stroke="white" stroke-opacity="0.2" stroke-width="1.66667" />
                        <path d="M11.473 14.7769C11.2795 14.5834 11.0499 14.4299 10.7971 14.3252C10.5443 14.2206 10.2734 14.1667 9.99984 14.1667C9.72625 14.1667 9.45534 14.2206 9.20258 14.3252C8.94982 14.4299 8.72015 14.5834 8.5267 14.7769L9.99984 16.25L11.473 14.7769Z" fill="#FF67C2" />
                    </svg>
                    <span className="orderly-text-danger-light orderly-text-xs">Failed to connect</span>
                </div>
            );
    }
    return (<></>);
};

import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { EditBtnState } from "./editBtn.script";


export const EditBtn: FC<EditBtnState> = (props) => {

    return (
        <Button variant="outlined" fullWidth color="secondary" size="sm">
            Edit
        </Button>
    );
}

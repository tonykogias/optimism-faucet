/* External Imports */
import React from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Info from "@mui/icons-material/Info";

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f8f8f8",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontFamily: "Inter",
    fontSize: 15,
    border: "1px solid #dadde9",
  },
}));

export default function InfoTooltip() {
  return (
    <CustomTooltip
      title={
        <React.Fragment>
          {"Anti-bot requirements:"}
          <br />
          <br />
          <b>{"- at least 5 followings"}</b>
          <br />
          <b>{"- account older than 1 month"}</b>
        </React.Fragment>
      }
      placement="top"
      arrow
    >
      <Info sx={{ fontSize: 16 }} />
    </CustomTooltip>
  );
}

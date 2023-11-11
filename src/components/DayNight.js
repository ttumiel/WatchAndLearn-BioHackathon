import React from "react";
import { useColorMode, Button } from "@chakra-ui/react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";

const DayNight = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button onClick={toggleColorMode}>
      {colorMode === "light" ? <IoMdMoon /> : <IoMdSunny />}
    </Button>
  );
};

export default DayNight;

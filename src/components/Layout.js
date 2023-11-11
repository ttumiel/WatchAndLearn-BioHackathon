import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import DayNight from "./DayNight";

const Layout = ({ children }) => {
  return (
    <Box position="relative" minH="100vh">
      <Flex align="flex-start" justify={"space-between"} px={12} pt={8}>
        <Box>
          <Heading as="h1" size="lg">
            Watch and Learn
          </Heading>
          <Text fontSize="sm" fontStyle="oblique">Converting Lab Demos to Shareable Protocols.</Text>
        </Box>
        <DayNight />
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};

export default Layout;

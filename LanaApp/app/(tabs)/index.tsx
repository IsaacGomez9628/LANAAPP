import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { FunnelIcon } from "phosphor-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const index = () => {
  return (
    <ScreenWrapper size={0.07}>
      <View>
        <Typo
          size={20}
          color={colors.white}
          fontWeight={"800"}
          style={{ padding: 15 }}
        >
          Descripcion General
        </Typo>
      </View>

      <View>
        <Typo size={15}>Para gastar</Typo>
        <TouchableOpacity>
          <FunnelIcon></FunnelIcon>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default index;

const styles = StyleSheet.create({});

// import React from "react";
// import { Pressable, StyleSheet, Text, View } from "react-native";
// // typos
// import { icons } from "lucide-react-native";

// const _spacing = 4;

// type TabItem = {
//   icon: IconNames;
//   label: string;
// };

// type TabsProps = {
//   data: TabItem[];
//   selectedIndex: number;
//   onChange: (index: number) => void;
//   activeColor?: string;
//   inactiveColor?: string;
//   activeBackgroundColor?: string;
//   inactiveBackgroundColor?: string;
// };

// type IconNames = keyof typeof icons;

// type IconProp = {
//   name: IconNames;
// };

// function Icon({ name }: IconProp) {
//   const IconComponent = icons[name];
//   return <IconComponent size={16} />;
// }

// export function Tabs({ data, selectedIndex, onChange } : TabsProps) {
//   return (
//     <View>
//       {data.map((item, index) => {

//         const isSelected = selectedIndex === index;
//         return (
//           <View key={index}>
//             <Pressable onPress={() => onChange(index)}
//                 style={{padding: _spacing, justifyContent: "center", alignItems: "center", gap: _spacing, flexDirection: "row", backgroundColor: isSelected ? }}>
//               <Icon name={item.icon} />
//               <Text>{item.label}</Text>
//             </Pressable>
//           </View>
//         );
//       })}
//     </View>
//   );
// };


// const styles = StyleSheet.create({});

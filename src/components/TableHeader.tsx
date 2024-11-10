import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

function TableHeader({title1, title2}: {title1: string; title2: string}) {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableHeader}>{title1}</Text>
      <Text style={styles.tableHeader}>{title2}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
});

export default TableHeader;

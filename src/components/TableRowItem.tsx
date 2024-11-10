import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

function TableRowItem({title, value}: {title: string; value: string}) {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{title}</Text>
      <Text style={styles.tableCell}>{value}</Text>
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
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: '#000',
  },
});
export default TableRowItem;

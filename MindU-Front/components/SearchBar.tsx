import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

interface SearchBarProps {
  onSearch: (query: string) => void;
  theme: {
    bg: string;
    text: string;
    subtext: string;
    card: string;
    border: string;
    surface: string;
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, theme }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <SearchIcon />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder="Search events..."
        placeholderTextColor={theme.subtext}
        value={query}
        onChangeText={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        delayLongPress={0}
        autoCorrect={false}
      />
      {query.length > 0 && (
        <Pressable
          onPress={handleClear}
          delayLongPress={0}
          pressRetentionOffset={0}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && { opacity: 0.5 },
          ]}
        >
          <CloseIcon />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
// app/venues/_layout.tsx
import { Stack } from 'expo-router';

export default function VenuesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Venues',
        }}
      />
      <Stack.Screen
        name="[slug]/[id]/index"
        options={{
          title: 'Venue Details',
        }}
      />
    </Stack>
  );
}
import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Welcome Banner Card
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Welcome, \(authViewModel.userName)!")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(Color(red: 0.12, green: 0.23, blue: 0.54))

                        Text("Jalpaiguri Civic Utilities, Bus Timings & Local Shop Directory")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(red: 0.94, green: 0.96, blue: 1.0))
                    .cornerRadius(16)

                    // Emergency Helplines Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Emergency Helplines")
                            .font(.subheadline)
                            .fontWeight(.bold)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                EmergencyCardView(title: "Police Control Room", number: "100", category: "POLICE")
                                EmergencyCardView(title: "District Hospital", number: "03561-222238", category: "HOSPITAL")
                                EmergencyCardView(title: "Fire Station", number: "101", category: "FIRE")
                            }
                        }
                    }

                    // Local Directory Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Jalpaiguri Local Directory")
                            .font(.subheadline)
                            .fontWeight(.bold)

                        ShopRowView(name: "Babu Sweet Stall", category: "Sweet Shop", location: "Kadamtala, Jalpaiguri", rating: "4.9")
                        ShopRowView(name: "Central Pharmacy", category: "Pharmacy", location: "DBC Road, Jalpaiguri", rating: "4.8")
                    }
                }
                .padding()
            }
            .navigationTitle("MYJPG")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        authViewModel.signOut()
                    }) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                    }
                }
            }
        }
    }
}

struct EmergencyCardView: View {
    let title: String
    let number: String
    let category: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(category)
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.red)
            Text(title)
                .font(.footnote)
                .fontWeight(.semibold)
            Spacer()
            Text(number)
                .font(.callout)
                .fontWeight(.bold)
                .foregroundColor(Color(red: 0.12, green: 0.23, blue: 0.54))
        }
        .padding(12)
        .frame(width: 170, height: 100)
        .background(Color(.systemPink).opacity(0.1))
        .cornerRadius(12)
    }
}

struct ShopRowView: View {
    let name: String
    let category: String
    let location: String
    let rating: String

    var body: some View {
        HStack {
            Image(systemName: "bag.fill")
                .foregroundColor(Color(red: 0.12, green: 0.23, blue: 0.54))
                .padding(10)
                .background(Color(red: 0.94, green: 0.96, blue: 1.0))
                .cornerRadius(8)

            VStack(alignment: .leading, spacing: 2) {
                Text(name).font(.subheadline).fontWeight(.semibold)
                Text("\(category) • \(location)").font(.caption).foregroundColor(.gray)
            }
            Spacer()
            Text("⭐ \(rating)")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.orange)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

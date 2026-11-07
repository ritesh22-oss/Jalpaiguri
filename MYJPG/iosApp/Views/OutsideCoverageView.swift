import SwiftUI

struct OutsideCoverageView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 12) {
                Image(systemName: "location.slash.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.orange)

                Text("Outside Jalpaiguri District")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.57, green: 0.25, blue: 0.05))

                Text("We detected that your current location is outside Jalpaiguri. MYJPG is tailored for Jalpaiguri civic utilities, local transport schedules, and emergency contacts.")
                    .font(.subheadline)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
            }
            .padding(20)
            .background(Color.yellow.opacity(0.15))
            .cornerRadius(16)

            Text("Your account session remains active.")
                .font(.caption)
                .foregroundColor(.gray)

            Spacer()

            Button(action: {
                authViewModel.isInsideJalpaiguri = true
            }) {
                Text("Select Jalpaiguri Locality Manually")
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color(red: 0.12, green: 0.23, blue: 0.54))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }

            Button(action: {
                authViewModel.isInsideJalpaiguri = true
            }) {
                Text("Explore Directory & Emergency Numbers")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(red: 0.12, green: 0.23, blue: 0.54), lineWidth: 1.5)
                    )
            }

            Spacer()

            Button(action: {
                authViewModel.signOut()
            }) {
                Text("Switch Account / Sign Out")
                    .foregroundColor(.red)
            }
            .padding(.bottom, 20)
        }
        .padding(24)
    }
}

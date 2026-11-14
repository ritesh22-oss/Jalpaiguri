import SwiftUI
import FirebaseAuth

struct AuthView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var phoneNumber: String = ""
    @State private var selectedLanguage: String = "English"

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Header Icon & Branding
            OfficialMYJPGEmblem()
                .frame(width: 84, height: 84)

            VStack(spacing: 6) {
                Text(selectedLanguage == "Bengali" ? "মাইজলপাইগুড়ি কানেক্ট" : "MYJPG - Jalpaiguri Connect")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.12, green: 0.23, blue: 0.54))

                Text(selectedLanguage == "Bengali" ? "জলপাইগুড়ির ডিজিটাল নাগরিক পোর্টাল" : "Civic Utility & Local Community Portal")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }

            Spacer()

            // Native Google Sign-In Button
            Button(action: {
                // Invokes Native GoogleSignIn SDK on iOS
                print("[MYJPG iOS] Initiating Native Google Sign-In...")
            }) {
                HStack {
                    Image(systemName: "g.circle.fill")
                        .font(.title3)
                    Text(selectedLanguage == "Bengali" ? "Google দিয়ে সাইন-ইন করুন" : "Sign in with Google")
                        .fontWeight(.bold)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color(red: 0.12, green: 0.23, blue: 0.54))
                .foregroundColor(.white)
                .cornerRadius(12)
            }

            HStack {
                VStack { Divider() }
                Text("OR")
                    .font(.caption)
                    .foregroundColor(.gray)
                VStack { Divider() }
            }

            // Phone Number Entry
            HStack {
                Text("+91")
                    .foregroundColor(.gray)
                TextField("10-digit Mobile Number", text: $phoneNumber)
                    .keyboardType(.numberPad)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)

            Button(action: {
                // Dispatches carrier SMS OTP via Firebase Auth
            }) {
                Text(selectedLanguage == "Bengali" ? "ওটিপি (OTP) পাঠান" : "Send Phone OTP")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .frame(height: 46)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(red: 0.12, green: 0.23, blue: 0.54), lineWidth: 1.5)
                    )
            }

            Spacer()

            // Language Switcher
            HStack {
                Button("English") { selectedLanguage = "English" }
                    .fontWeight(selectedLanguage == "English" ? .bold : .regular)
                Text("|").foregroundColor(.gray)
                Button("বাংলা") { selectedLanguage = "Bengali" }
                    .fontWeight(selectedLanguage == "Bengali" ? .bold : .regular)
            }
            .padding(.bottom, 20)
        }
        .padding(24)
    }
}

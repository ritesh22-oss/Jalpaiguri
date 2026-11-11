import SwiftUI
import FirebaseCore
import FirebaseAuth

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
    ) -> Bool {
        // Initialize Firebase SDK for Native iOS
        FirebaseApp.configure()
        print("[MYJPG iOS] Firebase initialized successfully")
        return true
    }
}

@main
struct MYJPGApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @StateObject private var authViewModel = AuthViewModel()
    @State private var isShowingLaunchSplash = true

    var body: some Scene {
        WindowGroup {
            ZStack {
                ContentView()
                    .environmentObject(authViewModel)

                if isShowingLaunchSplash {
                    NativeSplashView()
                        .transition(.opacity)
                        .zIndex(1)
                }
            }
            .task {
                // The native launch screen covers process startup. This short branded bridge
                // restores the MYJPG three-dot animation while auth state is restored.
                try? await Task.sleep(nanoseconds: 1_400_000_000)
                withAnimation(.easeOut(duration: 0.25)) {
                    isShowingLaunchSplash = false
                }
            }
        }
    }
}

private struct NativeSplashView: View {
    @State private var activeDot = 0

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.90, green: 0.96, blue: 1.0), .white],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 18) {
                Image(systemName: "mappin.and.ellipse")
                    .font(.system(size: 56, weight: .bold))
                    .foregroundStyle(Color(red: 0.0, green: 0.48, blue: 1.0))
                Text("MYJPG")
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundStyle(Color(red: 0.0, green: 0.18, blue: 0.38))
                Text("JALPAIGURI CONNECTED")
                    .font(.caption.weight(.bold))
                    .tracking(2)
                    .foregroundStyle(Color(red: 0.0, green: 0.38, blue: 0.78))

                HStack(spacing: 9) {
                    ForEach(0..<3, id: \.self) { index in
                        Circle()
                            .fill(index == activeDot ? Color(red: 0.0, green: 0.48, blue: 1.0) : Color(red: 0.38, green: 0.69, blue: 0.95))
                            .frame(width: 9, height: 9)
                            .scaleEffect(index == activeDot ? 1.15 : 0.8)
                    }
                }
                .padding(.top, 4)
            }
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 280_000_000)
                activeDot = (activeDot + 1) % 3
            }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        Group {
            if authViewModel.isLoading {
                ProgressView("Restoring Jalpaiguri Session...")
            } else if authViewModel.isAuthenticated {
                if authViewModel.isInsideJalpaiguri {
                    HomeView()
                } else {
                    OutsideCoverageView()
                }
            } else {
                AuthView()
            }
        }
    }
}

class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = true
    @Published var isInsideJalpaiguri: Bool = true
    @Published var userName: String = ""
    @Published var errorMessage: String? = nil

    private var handle: AuthStateDidChangeListenerHandle?

    init() {
        listenToAuth()
    }

    func listenToAuth() {
        handle = Auth.auth().addStateDidChangeListener { [weak self] (_, user) in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let user = user {
                    self?.isAuthenticated = true
                    self?.userName = user.displayName ?? "Citizen"
                } else {
                    self?.isAuthenticated = false
                    self?.userName = ""
                }
            }
        }
    }

    func signOut() {
        do {
            try Auth.auth().signOut()
            self.isAuthenticated = false
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }

    deinit {
        if let handle = handle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }
}

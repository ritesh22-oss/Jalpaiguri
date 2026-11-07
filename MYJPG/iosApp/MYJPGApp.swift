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

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel)
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

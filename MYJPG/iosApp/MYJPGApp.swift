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
                    PremiumSplashView()
                        .transition(.opacity)
                        .zIndex(1)
                }
            }
            .task {
                // The custom loading screen runs for ~2.5s minimum while Firebase auth restores.
                // Hard maximum 4s — the app opens regardless.
                let minDuration: UInt64 = 2_500_000_000
                try? await Task.sleep(nanoseconds: minDuration)
                withAnimation(.easeOut(duration: 0.35)) {
                    isShowingLaunchSplash = false
                }
            }
        }
    }
}

// MARK: - Premium Animated Splash Screen

private struct PremiumSplashView: View {
    @State private var activeDot = 0
    @State private var currentIconIndex = 0
    @State private var currentMessageIndex = 0
    @State private var iconOpacity: Double = 1.0
    @State private var iconScale: CGFloat = 1.0
    @State private var messageOpacity: Double = 1.0
    @State private var isPulsing = false

    private let messages = [
        "Connecting Jalpaiguri...",
        "Discovering local services...",
        "Finding neighbourhood shops...",
        "Connecting people & communities...",
        "Making Jalpaiguri smarter..."
    ]

    // MYJPG brand colors
    private let blueDeep = Color(red: 0.059, green: 0.090, blue: 0.165)    // #0F172A
    private let bluePrimary = Color(red: 0.145, green: 0.388, blue: 0.922) // #2563EB
    private let blueLight = Color(red: 0.859, green: 0.914, blue: 0.976)   // #DBEAFE
    private let blueBorder = Color(red: 0.749, green: 0.859, blue: 0.996)  // #BFDBFE
    private let bluePillBg = Color(red: 0.937, green: 0.965, blue: 1.0)   // #EFF6FF
    private let textTagline = Color(red: 0.114, green: 0.306, blue: 0.847) // #1D4ED8

    var body: some View {
        ZStack {
            // Elegant Multi-Stop Ambient Background
            LinearGradient(
                colors: [
                    Color(red: 0.92, green: 0.95, blue: 0.99),
                    Color(red: 0.96, green: 0.98, blue: 1.0),
                    .white
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // 1. OFFICIAL MYJPG BRAND LOGO CARD
                VStack(spacing: 6) {
                    OfficialMYJPGEmblem()
                        .frame(width: 58, height: 64)

                    HStack(spacing: 2) {
                        Text("MY")
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .foregroundStyle(blueDeep)
                        Text("JPG")
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .foregroundStyle(bluePrimary)
                    }

                    Text("JALPAIGURI CONNECTED")
                        .font(.system(size: 7.5, weight: .bold))
                        .tracking(2.2)
                        .foregroundStyle(textTagline)
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(Color.white)
                        .shadow(color: Color(red: 0.114, green: 0.306, blue: 0.847).opacity(0.08), radius: 12, x: 0, y: 6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(blueLight, lineWidth: 1.2)
                        )
                )
                .padding(.bottom, 24)

                // 2. ANIMATED SERVICE SHOWCASE BADGE (JioMart Polish)
                ZStack {
                    // Outer pulse ring
                    Circle()
                        .stroke(bluePrimary.opacity(isPulsing ? 0.0 : 0.4), lineWidth: 1.5)
                        .frame(width: isPulsing ? 76 : 64, height: isPulsing ? 76 : 64)

                    // Badge circle
                    Circle()
                        .fill(bluePillBg)
                        .frame(width: 64, height: 64)
                        .overlay(
                            Circle()
                                .stroke(blueBorder, lineWidth: 1.2)
                        )

                    // Animated Service Illustration
                    ServiceIconView(iconIndex: currentIconIndex, color: bluePrimary)
                        .frame(width: 38, height: 38)
                        .opacity(iconOpacity)
                        .scaleEffect(iconScale)
                }
                .padding(.bottom, 18)

                // 3. ROTATING MESSAGE PILL CHIP
                HStack(spacing: 7) {
                    Circle()
                        .fill(bluePrimary)
                        .frame(width: 6, height: 6)

                    Text(messages[currentMessageIndex])
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(textTagline)
                        .opacity(messageOpacity)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 7)
                .background(
                    Capsule()
                        .fill(bluePillBg)
                        .overlay(
                            Capsule()
                                .stroke(blueBorder, lineWidth: 1)
                        )
                )
                .padding(.bottom, 22)

                // 4. MODERN EXPANDING PILL THREE-DOT INDICATOR
                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) { index in
                        if index == activeDot {
                            Capsule()
                                .fill(bluePrimary)
                                .frame(width: 18, height: 6)
                                .animation(.spring(response: 0.3, dampingFraction: 0.7), value: activeDot)
                        } else {
                            Circle()
                                .fill(blueBorder)
                                .frame(width: 6, height: 6)
                                .animation(.spring(response: 0.3, dampingFraction: 0.7), value: activeDot)
                        }
                    }
                }
                .padding(.bottom, 24)

                Spacer()

                // BOTTOM BRAND FOOTER
                VStack(spacing: 3) {
                    HStack(spacing: 2) {
                        Text("MY")
                            .font(.system(size: 21, weight: .black, design: .rounded))
                            .foregroundStyle(blueDeep)
                        Text("JPG")
                            .font(.system(size: 21, weight: .black, design: .rounded))
                            .foregroundStyle(bluePrimary)
                    }

                    Text("• JALPAIGURI CONNECTED •")
                        .font(.system(size: 9.5, weight: .bold))
                        .tracking(2.6)
                        .foregroundStyle(textTagline)
                }
                .padding(.bottom, 42)
            }
        }
        .task {
            withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: false)) {
                isPulsing = true
            }
        }
        .task {
            await runDotAnimation()
        }
        .task {
            await runIconAnimation()
        }
        .task {
            await runMessageAnimation()
        }
    }

    // MARK: - Animation loops

    private func runDotAnimation() async {
        while !Task.isCancelled {
            try? await Task.sleep(nanoseconds: 280_000_000)
            withAnimation(.easeInOut(duration: 0.15)) {
                activeDot = (activeDot + 1) % 3
            }
        }
    }

    private func runIconAnimation() async {
        while !Task.isCancelled {
            try? await Task.sleep(nanoseconds: 300_000_000)

            withAnimation(.easeIn(duration: 0.18)) {
                iconOpacity = 0.0
                iconScale = 0.88
            }
            try? await Task.sleep(nanoseconds: 180_000_000)

            currentIconIndex = (currentIconIndex + 1) % 7

            withAnimation(.easeOut(duration: 0.18)) {
                iconOpacity = 1.0
                iconScale = 1.0
            }
            try? await Task.sleep(nanoseconds: 180_000_000)
        }
    }

    private func runMessageAnimation() async {
        while !Task.isCancelled {
            try? await Task.sleep(nanoseconds: 500_000_000)

            withAnimation(.easeIn(duration: 0.12)) {
                messageOpacity = 0.0
            }
            try? await Task.sleep(nanoseconds: 120_000_000)

            currentMessageIndex = (currentMessageIndex + 1) % messages.count

            withAnimation(.easeOut(duration: 0.12)) {
                messageOpacity = 1.0
            }
            try? await Task.sleep(nanoseconds: 120_000_000)
        }
    }
}

// MARK: - Official MYJPG Map Pin Emblem Vector (Parity with BrandLogo.tsx)

struct OfficialMYJPGEmblem: View {
    var body: some View {
        Canvas { context, size in
            let scaleX = size.width / 120.0
            let scaleY = size.height / 120.0

            // 1. Glossy Cyan-to-Royal Blue Map Pin Teardrop
            var pinPath = Path()
            pinPath.move(to: CGPoint(x: 37.8 * scaleX, y: 61.5 * scaleY))
            pinPath.addArc(
                center: CGPoint(x: 60.0 * scaleX, y: 42.0 * scaleY),
                radius: 28.0 * scaleX,
                startAngle: .degrees(136),
                endAngle: .degrees(44),
                clockwise: false
            )
            pinPath.addLine(to: CGPoint(x: 60.0 * scaleX, y: 92.5 * scaleY))
            pinPath.closeSubpath()

            let pinGradient = Gradient(colors: [
                Color(red: 0.08, green: 0.80, blue: 0.96),
                Color(red: 0.09, green: 0.48, blue: 0.92),
                Color(red: 0.02, green: 0.25, blue: 0.72)
            ])
            context.fill(pinPath, with: .linearGradient(pinGradient, startPoint: .zero, endPoint: CGPoint(x: size.width, y: size.height)))

            // 2. White circular cutout inside upper area of pin
            var whiteCircle = Path()
            whiteCircle.addEllipse(in: CGRect(
                x: (60.0 - 16.5) * scaleX,
                y: (42.0 - 16.5) * scaleY,
                width: 33.0 * scaleX,
                height: 33.0 * scaleY
            ))
            context.fill(whiteCircle, with: .color(.white))

            // 3. Three Connected Community Network Nodes (Closed Triangle)
            let nodeColor = Color(red: 0.02, green: 0.28, blue: 0.78)

            var lines = Path()
            lines.move(to: CGPoint(x: 60.0 * scaleX, y: 33.5 * scaleY))
            lines.addLine(to: CGPoint(x: 52.2 * scaleX, y: 45.8 * scaleY))
            lines.addLine(to: CGPoint(x: 67.8 * scaleX, y: 45.8 * scaleY))
            lines.closeSubpath()
            context.stroke(lines, with: .color(nodeColor), style: StrokeStyle(lineWidth: 2.8 * scaleX, lineCap: .round, lineJoin: .round))

            var nodes = Path()
            nodes.addEllipse(in: CGRect(x: (60.0 - 3.8) * scaleX, y: (33.5 - 3.8) * scaleY, width: 7.6 * scaleX, height: 7.6 * scaleY))
            nodes.addEllipse(in: CGRect(x: (52.2 - 3.8) * scaleX, y: (45.8 - 3.8) * scaleY, width: 7.6 * scaleX, height: 7.6 * scaleY))
            nodes.addEllipse(in: CGRect(x: (67.8 - 3.8) * scaleX, y: (45.8 - 3.8) * scaleY, width: 7.6 * scaleX, height: 7.6 * scaleY))
            context.fill(nodes, with: .color(nodeColor))

            // 4. Bold White 'J' inside lower tapered section
            var jPath = Path()
            jPath.move(to: CGPoint(x: 61.5 * scaleX, y: 63.5 * scaleY))
            jPath.addLine(to: CGPoint(x: 61.5 * scaleX, y: 76.5 * scaleY))
            jPath.addQuadCurve(
                to: CGPoint(x: 52.0 * scaleX, y: 78.0 * scaleY),
                control: CGPoint(x: 56.0 * scaleX, y: 84.0 * scaleY)
            )
            context.stroke(jPath, with: .color(.white), style: StrokeStyle(lineWidth: 3.6 * scaleX, lineCap: .round, lineJoin: .round))
        }
    }
}

// MARK: - Service Icon Drawings

private struct ServiceIconView: View {
    let iconIndex: Int
    let color: Color

    var body: some View {
        Canvas { context, size in
            let rect = CGRect(origin: .zero, size: size)
            let center = CGPoint(x: rect.midX, y: rect.midY)
            let s = min(size.width, size.height)

            var path = Path()

            switch iconIndex {
            case 0:
                drawShoppingBasket(path: &path, center: center, size: s)
            case 1:
                drawMedicalCross(path: &path, center: center, size: s)
            case 2:
                drawBloodDrop(path: &path, center: center, size: s)
            case 3:
                drawBus(path: &path, center: center, size: s)
            case 4:
                drawGraduationCap(path: &path, center: center, size: s)
            case 5:
                drawWrench(path: &path, center: center, size: s)
            case 6:
                drawLocationPins(path: &path, center: center, size: s)
            default:
                break
            }

            context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: 2.2, lineCap: .round, lineJoin: .round))
        }
    }

    private func drawShoppingBasket(path: inout Path, center: CGPoint, size: CGFloat) {
        let w = size * 0.72
        let h = size * 0.44
        let topW = s * 0.52
        let y0 = center.y - h * 0.15

        path.move(to: CGPoint(x: center.x - topW/2, y: y0))
        path.addLine(to: CGPoint(x: center.x - w/2, y: y0 + h))
        path.addLine(to: CGPoint(x: center.x + w/2, y: y0 + h))
        path.addLine(to: CGPoint(x: center.x + topW/2, y: y0))
        path.closeSubpath()

        path.move(to: CGPoint(x: center.x - topW * 0.35, y: y0))
        path.addQuadCurve(
            to: CGPoint(x: center.x + topW * 0.35, y: y0),
            control: CGPoint(x: center.x, y: y0 - h * 0.75)
        )

        path.move(to: CGPoint(x: center.x, y: y0))
        path.addLine(to: CGPoint(x: center.x, y: y0 + h))
        path.move(to: CGPoint(x: center.x - topW * 0.22, y: y0 + h * 0.5))
        path.addLine(to: CGPoint(x: center.x + topW * 0.22, y: y0 + h * 0.5))
    }

    private func drawMedicalCross(path: inout Path, center: CGPoint, size: CGFloat) {
        let arm = size * 0.34
        let thick = size * 0.15
        let r: CGFloat = 3

        path.addRoundedRect(
            in: CGRect(x: center.x - thick/2, y: center.y - arm, width: thick, height: arm * 2),
            cornerSize: CGSize(width: r, height: r)
        )
        path.addRoundedRect(
            in: CGRect(x: center.x - arm, y: center.y - thick/2, width: arm * 2, height: thick),
            cornerSize: CGSize(width: r, height: r)
        )
    }

    private func drawBloodDrop(path: inout Path, center: CGPoint, size: CGFloat) {
        let dropH = size * 0.56
        let dropW = size * 0.36
        let top = center.y - dropH * 0.48

        path.move(to: CGPoint(x: center.x, y: top))
        path.addQuadCurve(
            to: CGPoint(x: center.x + dropW, y: center.y + dropH * 0.2),
            control: CGPoint(x: center.x + dropW * 0.8, y: center.y - dropH * 0.1)
        )
        path.addQuadCurve(
            to: CGPoint(x: center.x, y: center.y + dropH * 0.55),
            control: CGPoint(x: center.x + dropW, y: center.y + dropH * 0.55)
        )
        path.addQuadCurve(
            to: CGPoint(x: center.x - dropW, y: center.y + dropH * 0.2),
            control: CGPoint(x: center.x - dropW, y: center.y + dropH * 0.55)
        )
        path.addQuadCurve(
            to: CGPoint(x: center.x, y: top),
            control: CGPoint(x: center.x - dropW * 0.8, y: center.y - dropH * 0.1)
        )
    }

    private func drawBus(path: inout Path, center: CGPoint, size: CGFloat) {
        let w = size * 0.64
        let h = size * 0.40
        let r: CGFloat = 5
        let y0 = center.y - h/2

        path.addRoundedRect(
            in: CGRect(x: center.x - w/2, y: y0, width: w, height: h),
            cornerSize: CGSize(width: r, height: r)
        )

        let winY = y0 + h * 0.22
        let winH = h * 0.36
        path.move(to: CGPoint(x: center.x - w/2, y: winY))
        path.addLine(to: CGPoint(x: center.x + w/2, y: winY))
        path.move(to: CGPoint(x: center.x - w/2, y: winY + winH))
        path.addLine(to: CGPoint(x: center.x + w/2, y: winY + winH))
        path.move(to: CGPoint(x: center.x, y: winY))
        path.addLine(to: CGPoint(x: center.x, y: winY + winH))

        let wheelR = size * 0.055
        let wheelY = y0 + h + wheelR * 0.4
        path.addEllipse(in: CGRect(x: center.x - w * 0.28 - wheelR, y: wheelY - wheelR, width: wheelR * 2, height: wheelR * 2))
        path.addEllipse(in: CGRect(x: center.x + w * 0.28 - wheelR, y: wheelY - wheelR, width: wheelR * 2, height: wheelR * 2))
    }

    private func drawGraduationCap(path: inout Path, center: CGPoint, size: CGFloat) {
        let capW = size * 0.62
        let capH = size * 0.15

        path.move(to: CGPoint(x: center.x, y: center.y - capH * 1.8))
        path.addLine(to: CGPoint(x: center.x + capW/2, y: center.y - capH * 0.4))
        path.addLine(to: CGPoint(x: center.x, y: center.y + capH * 0.4))
        path.addLine(to: CGPoint(x: center.x - capW/2, y: center.y - capH * 0.4))
        path.closeSubpath()

        let tasselStart = CGPoint(x: center.x + capW/2, y: center.y - capH * 0.4)
        path.move(to: tasselStart)
        path.addLine(to: CGPoint(x: tasselStart.x, y: tasselStart.y + size * 0.22))

        let ballR = size * 0.03
        path.addEllipse(in: CGRect(x: tasselStart.x - ballR, y: tasselStart.y + size * 0.22, width: ballR * 2, height: ballR * 2))

        path.move(to: CGPoint(x: center.x - capW * 0.34, y: center.y))
        path.addQuadCurve(
            to: CGPoint(x: center.x + capW * 0.34, y: center.y),
            control: CGPoint(x: center.x, y: center.y + capH * 1.8)
        )
    }

    private func drawWrench(path: inout Path, center: CGPoint, size: CGFloat) {
        let headR = size * 0.12
        let handleLen = size * 0.34
        let handleW = size * 0.06

        let headCenter = CGPoint(x: center.x - size * 0.10, y: center.y - size * 0.10)
        path.addEllipse(in: CGRect(x: headCenter.x - headR, y: headCenter.y - headR, width: headR * 2, height: headR * 2))

        let angle = CGFloat.pi / 4
        let hx = headCenter.x + cos(angle) * headR
        let hy = headCenter.y + sin(angle) * headR
        let ex = hx + cos(angle) * handleLen
        let ey = hy + sin(angle) * handleLen

        path.move(to: CGPoint(x: hx - cos(angle + .pi/2) * handleW, y: hy - sin(angle + .pi/2) * handleW))
        path.addLine(to: CGPoint(x: ex - cos(angle + .pi/2) * handleW, y: ey - sin(angle + .pi/2) * handleW))
        path.addLine(to: CGPoint(x: ex + cos(angle + .pi/2) * handleW, y: ey + sin(angle + .pi/2) * handleW))
        path.addLine(to: CGPoint(x: hx + cos(angle + .pi/2) * handleW, y: hy + sin(angle + .pi/2) * handleW))
        path.closeSubpath()
    }

    private func drawLocationPins(path: inout Path, center: CGPoint, size: CGFloat) {
        drawSinglePin(path: &path, at: CGPoint(x: center.x - size * 0.19, y: center.y - size * 0.04), pinSize: size * 0.34)
        drawSinglePin(path: &path, at: CGPoint(x: center.x + size * 0.19, y: center.y - size * 0.04), pinSize: size * 0.34)

        path.move(to: CGPoint(x: center.x - size * 0.19, y: center.y + size * 0.14))
        path.addQuadCurve(
            to: CGPoint(x: center.x + size * 0.19, y: center.y + size * 0.14),
            control: CGPoint(x: center.x, y: center.y + size * 0.26)
        )
    }

    private func drawSinglePin(path: inout Path, at point: CGPoint, pinSize: CGFloat) {
        let r = pinSize * 0.3
        path.addEllipse(in: CGRect(x: point.x - r, y: point.y - r, width: r * 2, height: r * 2))
        path.move(to: CGPoint(x: point.x - r * 0.7, y: point.y + r * 0.6))
        path.addLine(to: CGPoint(x: point.x, y: point.y + pinSize * 0.65))
        path.addLine(to: CGPoint(x: point.x + r * 0.7, y: point.y + r * 0.6))
    }
}

// MARK: - Content View (Auth Router)

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

// MARK: - Auth View Model

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

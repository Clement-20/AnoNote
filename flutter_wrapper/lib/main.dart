import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:share_plus/share_plus.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set native status bar and system navigation bar styles to blend perfectly with AnoNote's dark UI theme
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF111B21), // Fits header color
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0B141A), // Fits bottom nav color
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(const AnoNoteApp());
}

class AnoNoteApp extends StatelessWidget {
  const AnoNoteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AnoNote Messenger',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B141A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0084FF),
          surface: Color(0xFF0B141A),
        ),
      ),
      home: const MainWebViewPage(),
    );
  }
}

class MainWebViewPage extends StatefulWidget {
  const MainWebViewPage({super.key});

  @override
  State<MainWebViewPage> createState() => _MainWebViewPageState();
}

class _MainWebViewPageState extends State<MainWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _progressValue = 0.0;

  // Change this to your live production or dev deployment URL
  final String _appUrl = "https://ais-dev-u6qxctn3yuuriucalqjrby-622545485148.europe-west2.run.app";

  @override
  void initState() {
    super.initState();

    // Initialize and configure WebViewController
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0B141A))
      ..setUserAgent("AnoNote_Flutter_Wrapper_Mobile_E2EE")
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _progressValue = progress / 100.0;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            // Inject app ready initialization event
            _controller.runJavaScript("console.log('AnoNote loaded in Flutter WebView');");
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint("WebView Error: ${error.description}");
          },
        ),
      )
      // Add JavascriptChannel for bidirectional bridge communication
      ..addJavaScriptChannel(
        'FlutterWebView',
        onMessageReceived: (JavaScriptMessage message) {
          _handleJavaScriptMessage(message.message);
        },
      )
      ..loadRequest(Uri.parse(_appUrl));
  }

  // Handle messages posted from the web application bridge
  void _handleJavaScriptMessage(String messageString) {
    try {
      final Map<String, dynamic> payload = jsonDecode(messageString);
      final String? event = payload['event'];
      final Map<String, dynamic> data = payload['data'] ?? {};

      if (event == null) return;

      switch (event) {
        case 'haptic':
          _triggerHaptic(data['type'] ?? 'light');
          break;
        case 'share':
          _triggerNativeShare(
            data['title'] ?? 'AnoNote Connection',
            data['text'] ?? '',
            data['url'] ?? '',
          );
          break;
        case 'updateBadge':
          _updateAppBadge(data['count'] ?? 0);
          break;
        case 'routeChanged':
          debugPrint("Active Route: ${data['path']}");
          break;
        case 'appReady':
          debugPrint("AnoNote Web App Signal: READY");
          break;
        default:
          debugPrint("Received unhandled Javascript event: $event");
      }
    } catch (e) {
      debugPrint("Error parsing JavaScript bridge message: $e");
    }
  }

  // Map and trigger native Android/iOS haptics
  void _triggerHaptic(String type) {
    switch (type) {
      case 'medium':
        HapticFeedback.mediumImpact();
        break;
      case 'heavy':
        HapticFeedback.heavyImpact();
        break;
      case 'success':
        HapticFeedback.vibrate();
        break;
      case 'error':
        HapticFeedback.vibrate();
        break;
      case 'light':
      default:
        HapticFeedback.lightImpact();
    }
  }

  // Invoke native system share dialogue
  void _triggerNativeShare(String title, String text, String url) {
    final String shareMessage = "$text\n$url".trim();
    Share.share(shareMessage, subject: title);
  }

  // Update app notification badges (log count to console or use native plugins)
  void _updateAppBadge(int count) {
    debugPrint("Native Unread Chats Count: $count");
  }

  @override
  Widget build(BuildContext context) {
    // Intercept hardware Back Button actions to navigate inside webview history instead of exiting app
    return WillPopScope(
      onWillPop: () async {
        if (await _controller.canGoBack()) {
          await _controller.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              // Main Web Content View
              WebViewWidget(controller: _controller),

              // Elegant Top loading progress bar
              if (_isLoading)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    value: _progressValue,
                    backgroundColor: Colors.transparent,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0084FF)),
                    minHeight: 3.0,
                  ),
                ),

              // Full page boot splash loader for a clean start
              if (_isLoading && _progressValue < 0.2)
                Container(
                  color: const Color(0xFF0B141A),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Small compact brand icon (WhatsApp / Instagram style)
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: const Color(0xFF111B21),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0x330084FF)),
                          ),
                          child: const Icon(
                            Icons.security,
                            color: Color(0xFF0084FF),
                            size: 28,
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'AnoNote',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            letterSpacing: -0.3,
                            color: Color(0xFFE9EDEF),
                          ),
                        ),
                        const SizedBox(height: 32),
                        const SizedBox(
                          width: 36,
                          height: 36,
                          child: CircularProgressIndicator(
                            strokeWidth: 3.0,
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0084FF)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

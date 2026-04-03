import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// CHANGE THIS IP TO YOUR PC'S LOCAL IP
// e.g., const String baseUrl = "http://192.168.1.5:3000/api";
const String baseUrl = "http://10.0.2.2:3000/api"; // 10.0.2.2 is for Android Emulator

class AuthService with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  String? _token;
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;

  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'token');
    if (token != null) {
      _token = token;
      // In a real app, you would verify token validity here
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _user = data['user'];
        await _storage.write(key: 'token', value: _token);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print("Login error: $e");
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _storage.delete(key: 'token');
    notifyListeners();
  }

  String? get token => _token;
}

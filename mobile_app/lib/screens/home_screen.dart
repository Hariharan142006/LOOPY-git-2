import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _tasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final token = auth.token;
    
    // IMPORTANT: Replace with your PC IP if testing on device
    // const String baseUrl = "http://192.168.1.xxx:3000/api";
    const String baseUrl = "http://10.0.2.2:3000/api"; 

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/agent/tasks'),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token'
        },
        body: jsonEncode({
          // Mock location for now
          'lat': 12.9716, 
          'lng': 77.5946 
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _tasks = data['available'] ?? [];
          _isLoading = false;
        });
      } else {
        print("Failed to load: ${response.body}");
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("Error fetching tasks: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          )
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _tasks.isEmpty 
              ? const Center(child: Text("No tasks available"))
              : ListView.builder(
                  itemCount: _tasks.length,
                  itemBuilder: (context, index) {
                    final task = _tasks[index];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.assignment),
                        title: Text('Pickup at ${task['address']['street']}'),
                        subtitle: Text('Status: ${task['status']}'),
                        trailing: ElevatedButton(
                            onPressed: () {
                                // Add Accept Logic Here
                            },
                            child: const Text("Accept"),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

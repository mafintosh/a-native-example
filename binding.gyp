{
  "targets": [{
    "target_name": "a_native_example",
    "sources": [
      "a_native_example.cc"
    ],
    "include_dirs": [
      "<!(node -e \"require('nan')\")",
    ]
  }]
}

#pragma once
#include <string>
#include <iostream>

#define MSG 0
#define MSG_INDENT_NEXT 1
#define MSG_UNINDENT_FROM_NOW 2

class MsgSys
{
public:
    int indentCount;
    bool actived = false;
    void Active(bool b);
    std::string Send(std::string a, int indent);
    std::string Layer(std::string a);
};
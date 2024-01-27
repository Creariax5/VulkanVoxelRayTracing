#include "msgSys.h"


void MsgSys::Active(bool b)
{
    if (b)
    {
        this->indentCount = 0;
        this->actived = true;
    }
    
    
}

std::string MsgSys::Send(std::string a, int indent)
{
    if (!this->actived)
    {
        return a;
    }
    

    std::string b = "[main core] ";

    if (indent == MSG_UNINDENT_FROM_NOW && this->indentCount > 0)
    {
        this->indentCount -= 1;
    }
    
    for (size_t i = 0; i < this->indentCount; i++)
    {
        b.append("--> ");
    }

    if (indent == MSG_INDENT_NEXT)
    {
        this->indentCount += 1;
    }
    

    b.append(a);

    return b;
}

std::string MsgSys::Layer(std::string a)
{

    if (!this->actived)
    {
        return a;
    }

    std::string b = "[main core][validation layer] ";
    for (size_t i = 0; i < this->indentCount; i++)
    {
        b.append("--> ");
    }

    b.append(a);

    return b;
}
